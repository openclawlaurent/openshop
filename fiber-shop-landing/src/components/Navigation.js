import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/Navigation.css';
import Logo from './Logo';

export default function Navigation() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="top-navigation">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <Logo size={32} />
          <span className="logo-text">FiberAgent</span>
        </Link>

        <ul className="nav-menu">
          <li className={`nav-item ${isActive('/')}`}>
            <Link to="/" className="nav-link">Home</Link>
          </li>
          <li className={`nav-item ${isActive('/demo')}`}>
            <Link to="/demo" className="nav-link">Demo</Link>
          </li>
          <li className={`nav-item ${isActive('/agent')}`}>
            <Link to="/agent" className="nav-link">For Agents</Link>
          </li>
          <li className={`nav-item ${isActive('/stats')}`}>
            <Link to="/stats" className="nav-link stats-link">📊 Stats</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
