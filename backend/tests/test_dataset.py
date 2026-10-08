import os
import sys
from pathlib import Path
import unittest
from unittest.mock import Mock, patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from fastapi.testclient import TestClient
from main import app
from routers import dataset

class DatasetTests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)
        self.env = patch.dict(os.environ, {"DASHBOARD_API_TOKEN": "offline"})
        self.env.start()
        self.addCleanup(self.env.stop)
        self.headers = {"Authorization": "Bearer offline"}

    def test_reads_are_authorized_and_do_not_expose_vectors(self):
        with patch.object(dataset, "read_all", return_value=[{"id": 1, "thai_text": "sample", "label": "ham"}]) as read:
            self.assertEqual(self.client.get('/api/dataset').status_code, 401)
            read.assert_not_called()
            response = self.client.get('/api/dataset', headers=self.headers)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()[0]['id'], '1')
        self.assertNotIn('embedding', response.json()[0])

    def test_queue_excludes_errors_and_reviewed_items(self):
        logs = [{"id": "a", "detection_status": "risk_found", "message_text": "risk"},
                {"id": "b", "detection_status": "uncertain", "message_text": "unsure"},
                {"id": "c", "detection_status": "error", "message_text": "error"}]
        with patch.object(dataset, 'sources_and_logs', return_value=([], logs)), patch.object(dataset, 'read_all', return_value=[{'candidate_id': 'a'}]):
            result = dataset.candidates()
        self.assertEqual([row['id'] for row in result], ['b'])
        self.assertIsNone(result[0]['similarity'])

    def test_invalid_label_and_empty_message_rejected(self):
        url = '/api/dataset/candidates/00000000-0000-0000-0000-000000000001/approve'
        for body in ({'message': 'sample', 'label': 'invalid'}, {'message': '   ', 'label': 'spam'}):
            self.assertEqual(self.client.post(url, headers=self.headers, json=body).status_code, 422)

    def test_retry_returns_saved_entry_without_embedding(self):
        db = Mock()
        db.table.return_value.select.return_value.eq.return_value.execute.return_value.data = [{'status':'saved', 'dataset_id':1}]
        db.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value.data = {'id':1, 'thai_text':'saved', 'label':'spam'}
        with patch.object(dataset, 'get_supabase_client', return_value=db), patch.object(dataset, 'embedding') as embed:
            result = dataset.review('candidate', dataset.Review(message='saved', label='spam'), 'saved')
        self.assertEqual(result['status'], 'saved')
        embed.assert_not_called()

    def test_new_approval_passes_edited_text_and_vector_to_rpc(self):
        db = Mock()
        db.table.return_value.select.return_value.eq.return_value.execute.return_value.data = []
        db.rpc.return_value.execute.side_effect = [Mock(data=[]), Mock(data={'status':'saved', 'entry':{'id':'1'}})]
        with patch.object(dataset, 'get_supabase_client', return_value=db), patch.object(dataset, 'candidates', return_value=[{'id':'candidate'}]), patch.object(dataset, 'embedding', return_value=[0.1]*768) as embed:
            result = dataset.review('candidate', dataset.Review(message=' edited ', label='ham'), 'saved')
        embed.assert_called_once_with('edited')
        self.assertEqual(db.rpc.call_args.args[1]['p_message'], 'edited')
        self.assertEqual(result['status'], 'saved')

    def test_similar_message_requires_confirmation_before_write(self):
        db = Mock()
        db.table.return_value.select.return_value.eq.return_value.execute.return_value.data = []
        db.rpc.return_value.execute.return_value.data = [{'thai_text':'existing', 'label':'spam', 'similarity':0.94}]
        with patch.object(dataset, 'get_supabase_client', return_value=db), patch.object(dataset, 'candidates', return_value=[{'id':'candidate'}]), patch.object(dataset, 'embedding', return_value=[0.1]*768):
            preview = dataset.review('candidate', dataset.Review(message='new', label='spam'), 'saved')
            self.assertEqual(preview['status'], 'review_required')
            self.assertEqual(preview['match']['similarity'], 94)
            self.assertEqual([call.args[0] for call in db.rpc.call_args_list], ['match_scam'])
            db.rpc.reset_mock()
            db.rpc.return_value.execute.side_effect = [Mock(data=[{'thai_text':'existing', 'label':'spam', 'similarity':0.94}]), Mock(data={'status':'saved'})]
            result = dataset.review('candidate', dataset.Review(message='new', label='spam', confirmMatch=preview['confirmation']), 'saved')
            self.assertEqual(result['status'], 'saved')
            self.assertEqual(db.rpc.call_args.args[0], 'review_dataset_candidate')
