import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard';
import Trade from './pages/Trade';
import TradeHistory from './pages/TradeHistory';

function App() {
  const location = useLocation();
  const [token, setToken] = useState(() => {
    const storedToken = localStorage.getItem('token');
    return storedToken || null;
  });

  const handleSetToken = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  return (
    <Routes>
      <Route 
        path="/login" 
        element={!token ? <Login setToken={handleSetToken} /> : <Navigate to="/" replace />} 
      />
      <Route 
      path="/register" 
      element={!token ? <Register /> : <Navigate to="/" />} 
      />
      <Route 
        path="/" 
        element={token ? <Dashboard setToken={handleSetToken} /> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/trade" 
        element={token ? <Trade /> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/trade-history" 
        element={token ? <TradeHistory /> : <Navigate to="/login" replace />} 
      />
    </Routes>
  );
}

export default App;