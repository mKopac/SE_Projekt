import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if user is logged in (based on token)
  useEffect(() => {
    const token = localStorage.getItem('token'); // or sessionStorage
    setIsLoggedIn(!!token);
  }, []);

  const handleHomeClick = () => {
    navigate('/');
  };

  const handleLogout = () => {
    localStorage.removeItem('token'); // clear JWT
    setIsLoggedIn(false);
    navigate('/login');
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
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        ) : (
          <Link to="/login" className="login-link">
            Login
          </Link>
        )}

        <button className="home-button" onClick={handleHomeClick}>
          Home
        </button>
      </div>
    </header>
  );
};

export default Header;
