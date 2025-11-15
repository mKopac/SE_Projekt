import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./../css/Header.css";
import logo from "../assets/fpvai.png";


const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    setIsLoggedIn(!!token);

    if (userData) {
      try {
        const user = JSON.parse(userData);
        setIsAdmin(user.role === "ADMIN");
      } catch {
        setIsAdmin(false);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setIsAdmin(false);
    navigate("/login");
  };

  const handleHomeClick = () => navigate("/");
  const handleProfileClick = () => navigate("/profile");
  const handleDashboardClick = () => navigate("/dashboard");
  const handleAdminClick = () => navigate("/admin/users");

  const currentPath = location.pathname;

  const renderNavButton = () => {
    if (!isLoggedIn) return null;

    if (currentPath === "/profile") {
      return (
        <button className="dashboard-button" onClick={handleDashboardClick}>
          Dashboard
        </button>
      );
    }

    if (currentPath === "/" || currentPath === "/dashboard") {
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

  const renderHomeButton = () => {
    if (currentPath === "/") {
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
      <div className="topbar-left" onClick={handleHomeClick}>
        <img
          src={logo}
          alt="Logo"
          style={{ height: "50px", objectFit: "contain" }}
        />

      </div>

      <div className="topbar-center">Systém na evidenciu praxe</div>

      <div className="topbar-right">
        <a className="faq-link" href="#faq" onClick={(e) => e.preventDefault()}>
          FAQ?
        </a>

        {isLoggedIn ? (
          <>
            {isAdmin && (
              <button className="admin-button" onClick={handleAdminClick}>
                Správa používateľov
              </button>
            )}

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
