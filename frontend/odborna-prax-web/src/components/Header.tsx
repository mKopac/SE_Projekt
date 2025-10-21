import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const navigate = useNavigate();

  const handleHomeClick = () => {
    navigate('/');
  };

  return (
    <header className="topbar">
      <div className="topbar-left">Logo</div>
      <div className="topbar-center">Systém na evidenciu praxe</div>
      <div className="topbar-right">
        <a className="faq-link" href="#faq" onClick={(e) => e.preventDefault()}>
          FAQ?
        </a>
        <Link to="/login" className="login-link">Login</Link>
        <button className="home-button" onClick={handleHomeClick}>
          Home
        </button>
      </div>
    </header>
  );
};

export default Header;
