import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleAuthPage } from './pages/GoogleAuthPage';
import { Home } from './pages/Home';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ConfigurePage } from './pages/ConfigurePage';
import { RequireSpreadsheet } from './components/RequireSpreadsheet';

function App() {
  return (
    <BrowserRouter basename="/sport">
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
    </BrowserRouter>
  );
}

export default App
