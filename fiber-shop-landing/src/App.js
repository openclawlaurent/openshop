import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import LandingPage from './pages/LandingPage';
import DemoPage from './pages/DemoPage';
import AgentPage from './pages/AgentPage';
import UserPage from './pages/UserPage';
import StatisticsPage from './components/StatisticsPage';

function App() {
  return (
    <Router>
      <Navigation />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/demo" element={<DemoPage />} />
        <Route path="/agent" element={<AgentPage />} />
        <Route path="/user" element={<UserPage />} />
        <Route path="/stats" element={<StatisticsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
