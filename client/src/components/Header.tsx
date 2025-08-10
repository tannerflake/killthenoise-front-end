import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logo from './Logo';

const Header: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname === path;
  };

  return (
    <header className="header">
      <div className="container">
        <div className="d-flex justify-between align-center">
          <Link to="/" className="logo-link">
            <Logo />
          </Link>
          
          <nav className="nav">
            <ul className="nav-list">
              <li className="nav-item">
                <Link 
                  to="/dashboard" 
                  className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
                >
                  Dashboard
                </Link>
              </li>
              <li className="nav-item">
                <Link 
                  to="/integrations" 
                  className={`nav-link ${isActive('/integrations') ? 'active' : ''}`}
                >
                  Integrations
                </Link>
              </li>


            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header; 