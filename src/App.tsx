import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleAuthPage } from './pages/GoogleAuthPage';
import { Home } from './pages/Home';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<GoogleAuthPage />} />
        <Route
          path="/:semaine"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/1" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
