import React, { useState, useEffect } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "./../css/LoginForm.css";

type Props = {
  onSubmit?: (email: string, password: string) => void;
};

export const LoginForm: React.FC<Props> = () => {
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
      setInfoMessage(
        "Registrácia prebehla úspešne. Potvrdzovací e-mail bol odoslaný."
      );
    }

    if (verification === "success") {
      setInfoMessage("Váš účet bol aktivovaný. Teraz sa môžete prihlásiť.");
    }

    if (verification === "error") {
      setInfoMessage("Overovací odkaz je neplatný alebo expiroval.");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError("Zadajte email.");
      return;
    }
    if (!password) {
      setError("Zadajte heslo.");
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
          "Prihlásenie zlyhalo."
        );
      }
    } catch (error) {
      console.error("Chyba pri prihlasovaní:", error);
      setError("Server momentálne nie je dostupný.");
    }
  };

  const handleForgotPassword = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (!email) {
      alert("Najprv zadajte svoj e-mail.");
      return;
    }

    const confirmed = window.confirm(
      `Chcete odoslať odkaz na obnovenie hesla na e-mail: ${email}?`
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
        alert("Odkaz na obnovenie hesla bol odoslaný na váš e-mail.");
      } else {
        const err = await response.json();
        alert(err.error || "Nepodarilo sa odoslať odkaz.");
      }
    } catch (error) {
      console.error(error);
      alert("Server momentálne nie je dostupný.");
    }
  };

  return (
    <div className="page-root">
      <Header />

      <main className="main-content">
        <div className="login-box-outer">
          <div className="login-box">
            <button className="logo-btn" aria-label="Logo tlačidlo">
              Logo?
            </button>

            {infoMessage && (
              <div className="form-info">
                {infoMessage}
                <button
                  type="button"
                  className="form-info-close"
                  onClick={() => setInfoMessage(null)}
                >
                  X
                </button>
              </div>
            )}

            <form className="login-form" onSubmit={handleSubmit} noValidate>
              <label className="input-label">
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="text-input"
                  placeholder="email@priklad.sk"
                  required
                />
              </label>

              <label className="input-label">
                Heslo
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="text-input"
                  placeholder="Heslo"
                  required
                />
              </label>

              <div className="small-links">
                <a href="#forgot" onClick={handleForgotPassword}>
                  Zabudnuté heslo? Zmeňte si ho tu.
                </a>
              </div>

              {error && <div className="form-error">{error}</div>}

              <div className="actions-row">
                <div className="register-note">
                  Ešte nemáte účet?
                  <br />
                  <Link to="/register">Zaregistrujte sa.</Link>
                </div>
                <button type="submit" className="submit-btn">
                  Prihlásiť
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
