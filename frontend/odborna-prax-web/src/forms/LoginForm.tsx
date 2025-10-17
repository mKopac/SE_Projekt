import React, { useState } from "react";
import './../css/LoginForm.css';

type Props = {
  onSubmit?: (email: string, password: string) => void;
};

export const LoginForm: React.FC<Props> = ({ onSubmit }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
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
    if (onSubmit) onSubmit(email, password);
  };

  return (
    <div className="page-root">
      <header className="topbar">
        <div className="topbar-left">Logo</div>
        <div className="topbar-center">Systém na evidenciu praxe</div>
        <div className="topbar-right">
          <a className="faq-link" href="#faq" onClick={(e) => e.preventDefault()}>
            FAQ?
          </a>
          <button className="home-button" onClick={() => alert("Home clicked")}>
            Home
          </button>
        </div>
      </header>

      <main className="main-content">
        <div className="login-box-outer">
          <div className="login-box">
            <button className="logo-btn" aria-label="Logo tlačidlo">
              Logo?
            </button>

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
                <a href="#forgot" onClick={(e) => e.preventDefault()}>
                  Zabudnuté heslo? Zmeňte si ho tu.
                </a>
              </div>

              {error && <div className="form-error">{error}</div>}

              <div className="actions-row">
                <div className="register-note">
                  Ešte nemáte účet?
                  <br />
                 <a> Zaregistrujte sa. </a>
                </div>
                <button type="submit" className="submit-btn">
                  Prihlásiť
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <footer className="footer">FOOTER</footer>
    </div>
  );
};

export default LoginForm;
