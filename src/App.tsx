import './App.css'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleAuthPage } from './pages/GoogleAuthPage';
import { Home } from './pages/Home';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/auth" element={<GoogleAuthPage />} />
        <Route
          path="/week/:semaine/:groupe"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/week/:semaine"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/week/1" replace />} />
      </Routes>
    </HashRouter>
  );
}

export default App
