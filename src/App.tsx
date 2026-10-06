// =============================================
// Senior Guard — App Router
// =============================================

import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Overview from './pages/Overview';
import ThreatLogs from './pages/ThreatLogs';
import LineGroups from './pages/LineGroups';
import GroupDashboard from './pages/GroupDashboard';
import Dataset from './pages/Dataset';
import DashboardAccess from './pages/DashboardAccess';

function App() {
  return (
    <Routes>
      <Route element={<DashboardAccess />}>
      <Route path="/login" element={null} />
      <Route element={<MainLayout />}>
        <Route path="/" element={<Overview />} />
        <Route path="/line-groups" element={<LineGroups />} />
        <Route path="/line-groups/:groupId" element={<GroupDashboard />} />
        <Route path="/threat-logs" element={<ThreatLogs />} />
        <Route path="/dataset" element={<Dataset />} />
      </Route>
      </Route>
    </Routes>
  );
}

export default App;
