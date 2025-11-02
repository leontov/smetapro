import { Route, Routes, Navigate, Link, useLocation } from 'react-router-dom';
import { EstimatesListPage } from './pages/EstimatesListPage';
import { EstimateEditorPage } from './pages/EstimateEditorPage';
import { SyncStatusIndicator } from './components/SyncStatusIndicator';

const navItems = [
  { to: '/estimates', label: 'Сметы' },
  { to: '/estimates/new', label: 'Новая смета' }
];

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside
        style={{
          width: '220px',
          padding: '1.5rem',
          background: 'rgba(15, 23, 42, 0.8)',
          borderRight: '1px solid rgba(148, 163, 184, 0.2)'
        }}
      >
        <h1 style={{ marginTop: 0, marginBottom: '2rem' }}>smeta.pro</h1>
        <nav>
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={location.pathname === item.to ? 'button-primary' : ''}
              style={{
                display: 'block',
                marginBottom: '1rem',
                padding: '0.75rem 1rem',
                borderRadius: '0.75rem',
                textDecoration: 'none',
                fontWeight: 600,
                background:
                  location.pathname === item.to
                    ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                    : 'rgba(148, 163, 184, 0.1)'
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <SyncStatusIndicator />
      </aside>
      <main style={{ flex: 1 }}>{children}</main>
    </div>
  );
};

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Layout>
            <Navigate to="/estimates" replace />
          </Layout>
        }
      />
      <Route
        path="/estimates"
        element={
          <Layout>
            <EstimatesListPage />
          </Layout>
        }
      />
      <Route
        path="/estimates/:estimateId"
        element={
          <Layout>
            <EstimateEditorPage />
          </Layout>
        }
      />
      <Route
        path="/estimates/new"
        element={
          <Layout>
            <EstimateEditorPage createMode />
          </Layout>
        }
      />
    </Routes>
  );
}

export default App;
