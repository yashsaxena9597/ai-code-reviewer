import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import RepoSettings from './pages/RepoSettings';
import Login from './pages/Login';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="repos/:repo/settings" element={<RepoSettings />} />
      </Route>
    </Routes>
  );
};

export default App;
