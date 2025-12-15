import React, { useState, useEffect } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "./../css/LoginForm.css";
import { useTranslation } from "react-i18next";

type Props = {
  onSubmit?: (email: string, password: string) => void;
};

export const LoginForm: React.FC<Props> = () => {
  const { t } = useTranslation("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const token = localStorage.getItem("token");
  if (token) return <Navigate to="/dashboard" replace />;

  useEffect(() => {
    const registered = searchParams.get("registered");
    const verification = searchParams.get("verification");

    if (registered === "success") {
      setInfoMessage(t("loginForm.info.registeredSuccess"));
    }

    if (verification === "success") {
      setInfoMessage(t("loginForm.info.verificationSuccess"));
    }

    if (verification === "error") {
      setInfoMessage(t("loginForm.info.verificationError"));
    }
  }, [searchParams, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError(t("loginForm.validation.emailRequired"));
      return;
    }
    if (!password) {
      setError(t("loginForm.validation.passwordRequired"));
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();

        // 🔐 uloží token aj používateľa
        localStorage.setItem("token", data.access_token);
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        }

        // 🔀 presmerovanie podľa roly
        if (data.user?.role === "ADMIN") {
          window.location.href = "/admin/users";
        } else {
          window.location.href = "/dashboard";
        }
      } else {
        const err = await response.json();
        setError(
          err.error ||
            err.message ||
            err.detail ||
            t("loginForm.errors.loginFailed")
        );
      }
    } catch (error) {
      console.error("Chyba pri prihlasovaní:", error);
      setError(t("loginForm.errors.serverUnavailable"));
    }
  };

  const handleForgotPassword = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (!email) {
      alert(t("loginForm.forgotPassword.enterEmailFirst"));
      return;
    }

    const confirmed = window.confirm(
      t("loginForm.forgotPassword.confirmSend", { email })
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        "http://localhost:8080/auth/request-password-reset",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      if (response.ok) {
        alert(t("loginForm.forgotPassword.sentOk"));
      } else {
        const err = await response.json();
        alert(err.error || t("loginForm.forgotPassword.sendFailed"));
      }
    } catch (error) {
      console.error(error);
      alert(t("loginForm.forgotPassword.serverUnavailable"));
    }
  };

  return (
    <div className="page-root">
      <Header />

      <main className="main-content">
        <div className="login-box-outer">
          <div className="login-box">
            <button className="logo-btn" aria-label={t("loginForm.logoAria")}>
              {t("loginForm.logoPlaceholder")}
            </button>

            {infoMessage && (
              <div className="form-info">
                {infoMessage}
                <button
                  type="button"
                  className="form-info-close"
                  onClick={() => setInfoMessage(null)}
                >
                  {t("loginForm.info.close")}
                </button>
              </div>
            )}

            <form className="login-form" onSubmit={handleSubmit} noValidate>
              <label className="input-label">
                {t("loginForm.fields.emailLabel")}
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="text-input"
                  placeholder={t("loginForm.fields.emailPlaceholder")}
                  required
                />
              </label>

              <label className="input-label">
                {t("loginForm.fields.passwordLabel")}
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="text-input"
                  placeholder={t("loginForm.fields.passwordPlaceholder")}
                  required
                />
              </label>

              <div className="small-links">
                <a href="#forgot" onClick={handleForgotPassword}>
                  {t("loginForm.forgotPassword.link")}
                </a>
              </div>

              {error && <div className="form-error">{error}</div>}

              <div className="actions-row">
                <div className="register-note">
                  {t("loginForm.registerNote.text")}
                  <br />
                  <Link to="/register">{t("loginForm.registerNote.link")}</Link>
                </div>
                <button type="submit" className="submit-btn">
                  {t("loginForm.submit")}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LoginForm;
