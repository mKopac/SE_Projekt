import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import "./../css/Header.css";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    navigate('/login');
  };

  const handleHomeClick = () => navigate('/');
  const handleProfileClick = () => navigate('/profile');
  const handleDashboardClick = () => navigate('/dashboard');

  const currentPath = location.pathname;

  // Dynamic "Profile / Dashboard" button
  const renderNavButton = () => {
    if (!isLoggedIn) return null;

    if (currentPath === '/profile') {
      return (
        <button className="dashboard-button" onClick={handleDashboardClick}>
          Dashboard
        </button>
      );
    }

    if (currentPath === '/' || currentPath === '/dashboard') {
      return (
        <button className="profile-button" onClick={handleProfileClick}>
          Profile
        </button>
      );
    }

    return (
      <button className="profile-button" onClick={handleProfileClick}>
        Profile
      </button>
    );
  };

  // Dynamic "Home / Dashboard" button
  const renderHomeButton = () => {
    if (currentPath === '/') {
      return (
        <button className="dashboard-button" onClick={handleDashboardClick}>
          Dashboard
        </button>
      );
    }
    return (
      <button className="home-button" onClick={handleHomeClick}>
        Home
      </button>
    );
  };

  return (
    <header className="topbar">
      <div className="topbar-left">Logo</div>
      <div className="topbar-center">Systém na evidenciu praxe</div>

      <div className="topbar-right">
        <a className="faq-link" href="#faq" onClick={(e) => e.preventDefault()}>
          FAQ?
        </a>

        {isLoggedIn ? (
          <>
            {renderNavButton()}
            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <Link to="/login" className="login-link">
            Login
          </Link>
        )}

        {renderHomeButton()}
      </div>
    </header>
  );
};

export default Header;
