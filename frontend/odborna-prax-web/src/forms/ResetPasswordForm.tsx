import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "./../css/LoginForm.css";

export const ResetPasswordForm = () => {
  const { t } = useTranslation("login");

  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [valid, setValid] = useState(false);
  const [checked, setChecked] = useState(false);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setError(t("resetPasswordForm.errors.invalidLink"));
      setChecked(true);
      return;
    }

    fetch(`https://localhost:8443/auth/verify-reset-token?token=${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.valid) setValid(true);
        else setError(t("resetPasswordForm.errors.invalidOrExpired"));
      })
      .catch(() => setError(t("resetPasswordForm.errors.verifyError")))
      .finally(() => setChecked(true));
  }, [token, t]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!password || !confirm) {
      setError(t("resetPasswordForm.errors.fillAllFields"));
      return;
    }
    if (password !== confirm) {
      setError(t("resetPasswordForm.errors.passwordMismatch"));
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("https://localhost:8443/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });

      if (response.ok) {
        const confirmed = window.confirm(
          t("resetPasswordForm.confirm.success")
        );

        if (confirmed) {
          window.location.href = "/login";
        } else {
          window.location.href = "/login";
        }
        return;
      } else {
        const err = await response.json();
        setError(err.error || t("resetPasswordForm.errors.resetFailed"));
      }
    } catch (error) {
      setError(t("resetPasswordForm.errors.serverUnavailable"));
    } finally {
      setLoading(false);
    }
  };

  if (!checked) {
    return (
      <div className="page-root">
        <Header />
        <main className="main-content">
          <div className="login-box-outer">
            <div className="login-box">
              {t("resetPasswordForm.loading.verifyingLink")}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!valid) {
    return (
      <div className="page-root">
        <Header />
        <main className="main-content">
          <div className="login-box-outer">
            <div className="login-box">
              <h2>{t("resetPasswordForm.invalid.title")}</h2>
              <p>{error}</p>
              <Link to="/login">{t("resetPasswordForm.backToLogin")}</Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="page-root">
      <Header />
      <main className="main-content">
        <div className="login-box-outer">
          <div className="login-box">
            <h2>{t("resetPasswordForm.title")}</h2>

            <form className="login-form" onSubmit={handleSubmit} noValidate>
              <label className="input-label">
                {t("resetPasswordForm.fields.newPassword.label")}
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="text-input"
                  placeholder={t("resetPasswordForm.fields.newPassword.placeholder")}
                  required
                />
              </label>

              <label className="input-label">
                {t("resetPasswordForm.fields.confirmPassword.label")}
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="text-input"
                  placeholder={t("resetPasswordForm.fields.confirmPassword.placeholder")}
                  required
                />
              </label>

              {error && <div className="form-error">{error}</div>}
              {message && <div className="form-success">{message}</div>}

              <div className="actions-row">
                <Link to="/login">{t("resetPasswordForm.backToLogin")}</Link>
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading
                    ? t("resetPasswordForm.actions.saving")
                    : t("resetPasswordForm.actions.submit")}
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
