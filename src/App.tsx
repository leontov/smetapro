import React, { Suspense, lazy, useState } from 'react';
import { NavLink, Route, Routes } from 'react-router-dom';
import { OfflineQueueAlert } from './components/OfflineQueueAlert';
import { ShareReportButton } from './components/ShareReportButton';
import PrivacyNotice from './components/PrivacyNotice';

const InsightsPage = lazy(() => import('./pages/InsightsPage'));
const PriceSourcesPage = lazy(() => import('./pages/PriceSourcesPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));

const App: React.FC = () => {
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h1>Smetapro</h1>
        <nav>
          <NavLink to="/insights" className={({ isActive }) => (isActive ? 'active' : undefined)}>Insights</NavLink>
          <NavLink to="/prices" className={({ isActive }) => (isActive ? 'active' : undefined)}>Источники цен</NavLink>
          <NavLink to="/reports" className={({ isActive }) => (isActive ? 'active' : undefined)}>Отчеты</NavLink>
        </nav>
        <ShareReportButton />
      </aside>
      <main className="main-content">
        <Suspense fallback={<div>Загрузка…</div>}>
          <Routes>
            <Route path="/" element={<InsightsPage />} />
            <Route path="/insights" element={<InsightsPage />} />
            <Route path="/prices" element={<PriceSourcesPage />} />
            <Route path="/reports" element={<ReportsPage />} />
          </Routes>
        </Suspense>
      </main>
      <OfflineQueueAlert />
      <PrivacyNotice open={!privacyAccepted} onAccept={() => setPrivacyAccepted(true)} />
    </div>
  );
};

export default App;
