import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '../context/ThemeContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProjectDetails from './pages/ProjectDetails';

function App() {
  const token = localStorage.getItem('token');

  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Dashboard route */}
          <Route
            path="/dashboard"
            element={token ? <Dashboard /> : <Navigate to="/login" />}
          />

          {/* Root redirects to dashboard if logged in */}
          <Route
            path="/"
            element={token ? <Navigate to="/dashboard" /> : <Navigate to="/login" />}
          />

          {/* Fixed: Changed :id to :projectId to match useParams */}
          <Route
            path="/projects/:projectId"
            element={token ? <ProjectDetails /> : <Navigate to="/login" />}
          />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;