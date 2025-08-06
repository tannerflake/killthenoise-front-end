import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';

const Header: React.FC = () => {
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
                <Link to="/dashboard" className="nav-link">
                  Dashboard
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/integrations" className="nav-link">
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