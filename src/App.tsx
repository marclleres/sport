import './App.css'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleAuthPage } from './pages/GoogleAuthPage';
import { Home } from './pages/Home';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ConfigurePage } from './pages/ConfigurePage';
import { RequireSpreadsheet } from './components/RequireSpreadsheet';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/auth" element={<GoogleAuthPage />} />
        <Route path="/configure" element={<ConfigurePage />} />
        <Route
          path="/:semaine"
          element={
            <ProtectedRoute>
              <RequireSpreadsheet>
                <Home />
              </RequireSpreadsheet>
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/1" replace />} />
      </Routes>
    </HashRouter>
  );
}

export default App
