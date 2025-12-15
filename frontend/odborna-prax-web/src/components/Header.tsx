import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./../css/Header.css";
import logo from "../assets/fpvai.png";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { i18n, t } = useTranslation("shared");

  const [isLangOpen, setIsLangOpen] = useState(false);

  // derive login/admin info directly from localStorage
  const token = localStorage.getItem("token");
  const userData = localStorage.getItem("user");

  const isLoggedIn = !!token;
  let isAdmin = false;

  if (userData) {
    try {
      const user = JSON.parse(userData);
      isAdmin = user.role === "ADMIN";
    } catch {
      isAdmin = false;
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleHomeClick = () => navigate("/");
  const handleProfileClick = () => navigate("/profile");
  const handleDashboardClick = () => navigate("/dashboard");
  const handleAdminClick = () => navigate("/admin/users");
  const handleFaqClick = () => navigate("/faq");

  const currentPath = location.pathname;

  const renderNavButton = () => {
    if (!isLoggedIn) return null;

    if (currentPath === "/profile") {
      return (
        <button className="dashboard-button" onClick={handleDashboardClick}>
          {t("header.dashboard")}
        </button>
      );
    }

    if (currentPath === "/" || currentPath === "/dashboard") {
      return (
        <button className="profile-button" onClick={handleProfileClick}>
          {t("header.profile")}
        </button>
      );
    }

    return (
      <button className="profile-button" onClick={handleProfileClick}>
        {t("header.profile")}
      </button>
    );
  };

  const renderHomeButton = () => {
    if (currentPath === "/") {
      return (
        <button className="dashboard-button" onClick={handleDashboardClick}>
          {t("header.dashboard")}
        </button>
      );
    }
    return (
      <button className="home-button" onClick={handleHomeClick}>
        {t("header.home")}
      </button>
    );
  };

  const currentLng = i18n.language?.substring(0, 2) || "sk";

  const handleLanguageChange = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("i18nextLng", lng);
    setIsLangOpen(false);
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

      <div className="topbar-center">{t("header.title")}</div>

      <div className="topbar-right">
        <div className="lang-dropdown">
          <button
            type="button"
            className="lang-button"
            onClick={() => setIsLangOpen((prev) => !prev)}
          >
            {currentLng === "sk" ? "SK ▾" : "EN ▾"}
          </button>

          {isLangOpen && (
            <div className="lang-menu">
              <button
                type="button"
                className="lang-option"
                onClick={() => handleLanguageChange("sk")}
              >
                SK
              </button>
              <button
                type="button"
                className="lang-option"
                onClick={() => handleLanguageChange("en")}
              >
                EN
              </button>
            </div>
          )}
        </div>

        <button className="faq" onClick={handleFaqClick}>
          {t("header.faq")}
        </button>

        {isLoggedIn ? (
          <>
            {isAdmin && (
              <button className="admin-button" onClick={handleAdminClick}>
                {t("header.adminUsers")}
              </button>
            )}

            {renderNavButton()}

            <button className="logout-button" onClick={handleLogout}>
              {t("header.logout")}
            </button>
          </>
        ) : (
          <Link to="/login" className="login-link">
            {t("header.login")}
          </Link>
        )}

        {renderHomeButton()}
      </div>
    </header>
  );
};

export default Header;
