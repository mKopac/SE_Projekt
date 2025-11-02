import React, { useState,useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "./../css/LoginForm.css";

export const ResetPasswordForm = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [valid, setValid] = useState(false);
  const [checked, setChecked] = useState(false);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
const [message, setMessage] = useState<string | null>(null);
const [error, setError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  // ✅ Overenie tokenu pri načítaní
  useEffect(() => {
    if (!token) {
      setError("Odkaz na reset hesla je neplatný.");
      setChecked(true);
      return;
    }

    fetch(`http://localhost:8080/auth/verify-reset-token?token=${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.valid) setValid(true);
        else setError("Odkaz na reset hesla je neplatný alebo expiroval.");
      })
      .catch(() => setError("Chyba pri overovaní odkazu."))
      .finally(() => setChecked(true));
  }, [token]);

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setError(null);
  setMessage(null);

  if (!password || !confirm) {
    setError("Vyplňte všetky polia.");
    return;
  }
  if (password !== confirm) {
    setError("Heslá sa nezhodujú.");
    return;
  }

  try {
    setLoading(true);
    const response = await fetch("http://localhost:8080/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword: password }),
    });

    if (response.ok) {
      setMessage("Heslo bolo úspešne zmenené. Môžete sa prihlásiť.");
      setValid(false); // po úspechu zneplatni formulár
    } else {
      const err = await response.json();
      setError(err.error || "Reset hesla zlyhal.");
    }
  } catch (error) {
    setError("Server momentálne nie je dostupný.");
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
            <div className="login-box">Načítavam overenie odkazu...</div>
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
              <h2>Reset hesla nie je možný</h2>
              <p>{error}</p>
              <Link to="/login">Späť na prihlásenie</Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ✅ ak je token platný, zobraz formulár
  return (
    <div className="page-root">
      <Header />
      <main className="main-content">
        <div className="login-box-outer">
          <div className="login-box">
            <h2>Obnovenie hesla</h2>

            <form className="login-form" onSubmit={handleSubmit} noValidate>
              <label className="input-label">
                Nové heslo
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="text-input"
                  placeholder="Zadajte nové heslo"
                  required
                />
              </label>

              <label className="input-label">
                Potvrdenie hesla
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="text-input"
                  placeholder="Zopakujte heslo"
                  required
                />
              </label>

              {error && <div className="form-error">{error}</div>}
              {message && <div className="form-success">{message}</div>}

              <div className="actions-row">
                <Link to="/login">Späť na prihlásenie</Link>
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? "Ukladám..." : "Obnoviť heslo"}
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