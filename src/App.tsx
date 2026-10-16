// =============================================
// Senior Guard — App Router
// =============================================

import { Navigate, Routes, Route, useParams } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Overview from './pages/Overview';
import ThreatLogs from './pages/ThreatLogs';
import LineGroups from './pages/LineGroups';
import GroupDashboard from './pages/GroupDashboard';
import Dataset from './pages/Dataset';
import DashboardAccess from './pages/DashboardAccess';
import MiniLayout from './mini/MiniLayout';
import MiniHistory from './mini/pages/MiniHistory';
import MiniDetail from './mini/pages/MiniDetail';
import MiniLessons from './mini/pages/MiniLessons';
import MiniHelp from './mini/pages/MiniHelp';
import MiniSettings from './mini/pages/MiniSettings';
import MiniChat from './mini/pages/MiniChat';

function LegacyGroupDashboardRedirect() {
  const { groupId } = useParams();
  return <Navigate to={`/line-groups/${groupId}/dashboard`} replace />;
}

function App() {
  return (
    <Routes>
      <Route path="/mini" element={<MiniLayout />}>
        <Route index element={<MiniHistory />} />
        <Route path="cases/:caseId" element={<MiniDetail />} />
        <Route path="lessons" element={<MiniLessons />} />
        <Route path="help" element={<MiniHelp />} />
        <Route path="settings" element={<MiniSettings />} />
        <Route path="chat" element={<MiniChat />} />
        <Route path="*" element={<MiniHelp />} />
      </Route>
      <Route element={<DashboardAccess />}>
      <Route path="/login" element={null} />
      <Route element={<MainLayout />}>
        <Route path="/" element={<Navigate to="/overview" replace />} />
        <Route path="/overview" element={<Overview />} />
        <Route path="/line-groups" element={<LineGroups />} />
        <Route path="/line-groups/:groupId" element={<LegacyGroupDashboardRedirect />} />
        <Route path="/line-groups/:groupId/dashboard" element={<GroupDashboard />} />
        <Route path="/threat-logs" element={<Navigate to="/risky-messages" replace />} />
        <Route path="/risky-messages" element={<ThreatLogs />} />
        <Route path="/dataset" element={<Dataset />} />
      </Route>
      </Route>
    </Routes>
  );
}

export default App;
