// =============================================
// Senior Guard — App Router
// =============================================

import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Overview from './pages/Overview';
import ThreatLogs from './pages/ThreatLogs';
import LineGroups from './pages/LineGroups';

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Overview />} />
        <Route path="/line-groups" element={<LineGroups />} />
        <Route path="/threat-logs" element={<ThreatLogs />} />
      </Route>
    </Routes>
  );
}

export default App;
