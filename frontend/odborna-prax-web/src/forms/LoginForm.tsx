import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
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
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [repeatNewPassword, setRepeatNewPassword] = useState("");

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
      const response = await fetch("https://localhost:8443/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();

        //uloží token aj používateľa
        localStorage.setItem("token", data.access_token);
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        }

        //presmerovanie podľa roly
        if (data.passwordNeedsChange) {
          setShowChangePassword(true);
          return;
        }

        //presmerovanie podľa role
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
        "https://localhost:8443/auth/request-password-reset",
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
            {showChangePassword && (
              <div className="force-password-overlay">
                <div className="force-password-modal">
                  <h3>Zmena hesla je povinná</h3>
                  <p>Z bezpečnostných dôvodov si musíte zmeniť heslo.</p>

                  <input
                    type="password"
                    placeholder="Nové heslo"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="text-input"
                  />

                  <input
                    type="password"
                    placeholder="Zopakujte nové heslo"
                    value={repeatNewPassword}
                    onChange={(e) => setRepeatNewPassword(e.target.value)}
                    className="text-input"
                  />

                  <button
                    onClick={async () => {
                      if (!newPassword || !repeatNewPassword) {
                        alert("Zadajte obe heslá");
                        return;
                      }

                      if (newPassword !== repeatNewPassword) {
                        alert("Heslá sa nezhodujú");
                        return;
                      }

                      try {
                        const res = await fetch(
                          "https://localhost:8443/auth/force-change-password",
                          {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                              Authorization: `Bearer ${localStorage.getItem("token")}`,
                            },
                            body: JSON.stringify({
                              newPassword,
                              repeatNewPassword,
                            }),
                          }
                        );

                        if (!res.ok) {
                          const err = await res.json();
                          alert(err.error || "Zmena hesla zlyhala");
                          return;
                        }

                        setShowChangePassword(false);
                        window.location.href = "/dashboard";
                      } catch {
                        alert("Server momentálne nie je dostupný.");
                      }
                    }}
                  >
                    Zmeniť heslo
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LoginForm;
