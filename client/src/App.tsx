import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import HubSpotCallback from './pages/HubSpotCallback';
import Header from './components/Header';
import HubSpotForm from './pages/HubSpotForm';

function App() {
  return (
    <div className="App">
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/hubspot/callback" element={<HubSpotCallback />} />
          <Route path="/hubspot/form" element={<HubSpotForm />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />

          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </main>
    </div>
  );
}

export default App; 