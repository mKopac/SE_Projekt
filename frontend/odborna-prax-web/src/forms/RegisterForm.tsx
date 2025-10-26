import React, { useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "./../css/RegisterForm.css";

export type RegisterFormData = {
  accountType: string;
  studyProgram: string;
  firstName: string;
  lastName: string;
  studentEmail: string;
  altEmail: string;
  phone: string;
  address: string;
  city: string;
  zip: string;
  consent: boolean;
};

type Props = {
  onSubmit?: (formData: RegisterFormData) => void;
};

export const RegisterForm: React.FC<Props> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<RegisterFormData>({
    accountType: "Študent",
    studyProgram: "AI22m",
    firstName: "",
    lastName: "",
    studentEmail: "",
    altEmail: "",
    phone: "",
    address: "",
    city: "",
    zip: "",
    consent: false,
  });

  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, type } = e.target;
    const value =
      type === "checkbox"
        ? (e.target as HTMLInputElement).checked
        : e.target.value;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.firstName || !formData.lastName) {
      setError("Zadajte meno a priezvisko.");
      return;
    }

    if (!formData.consent) {
      setError("Musíte súhlasiť so spracovaním osobných údajov.");
      return;
    }

    if (onSubmit) onSubmit(formData);
    else alert("Formulár odoslaný!");
  };

  const isFirma = formData.accountType === "Firma";

  return (
    <div className="page-root">
      <Header />

      <main className="main-content">
        <div className="login-box-outer register-outer">
          <div className="login-box register-box">
            <h2 className="form-title">Registrácia</h2>

            <form className="register-form" onSubmit={handleSubmit} noValidate>
              <div className="form-row two-cols">
                <label>
                  Vyberte si typ účtu
                  <select
                    name="accountType"
                    value={formData.accountType}
                    onChange={handleChange}
                  >
                    <option>Študent</option>
                    <option>Garant</option>
                    <option>Firma</option>
                  </select>
                </label>

                {!isFirma && (
                  <label>
                    Vyberte študijný odbor
                    <select
                      name="studyProgram"
                      value={formData.studyProgram}
                      onChange={handleChange}
                    >
                      <option>AI22m</option>
                      <option>AI22b</option>
                    </select>
                  </label>
                )}
              </div>

              <div className="form-row two-cols">
                <label>
                  Meno
                  <input
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="text-input"
                    type="text"
                  />
                </label>
                <label>
                  Priezvisko
                  <input
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="text-input"
                    type="text"
                  />
                </label>
              </div>

              {isFirma ? (
                <>
                  <label>
                    Firemný email
                    <input
                      name="studentEmail"
                      value={formData.studentEmail}
                      onChange={handleChange}
                      className="text-input"
                      type="email"
                    />
                  </label>

                  <label>
                    Telefón
                    <input
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="text-input"
                      type="tel"
                    />
                  </label>

                  <label>
                    Adresa firmy
                    <input
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="text-input"
                      type="text"
                    />
                  </label>
                </>
              ) : (
                <>
                  <label>
                    Študentský email
                    <input
                      name="studentEmail"
                      value={formData.studentEmail}
                      onChange={handleChange}
                      className="text-input"
                      type="email"
                    />
                  </label>

                  <label>
                    Alternatívny email
                    <input
                      name="altEmail"
                      value={formData.altEmail}
                      onChange={handleChange}
                      className="text-input"
                      type="email"
                    />
                  </label>

                  <label>
                    Telefón
                    <input
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="text-input"
                      type="tel"
                    />
                  </label>

                  <label>
                    Adresa
                    <input
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="text-input"
                      type="text"
                    />
                  </label>
                </>
              )}

              <div className="form-row two-cols">
                <label>
                  Mesto
                  <input
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="text-input"
                    type="text"
                  />
                </label>
                <label>
                  PSČ
                  <input
                    name="zip"
                    value={formData.zip}
                    onChange={handleChange}
                    className="text-input"
                    type="text"
                  />
                </label>
              </div>

              {error && <div className="form-error">{error}</div>}

              <div className="actions-row consent-actions">
                <div className="consent-left">
                  <input
                    type="checkbox"
                    name="consent"
                    checked={formData.consent}
                    onChange={handleChange}
                    id="consent"
                  />
                  <label htmlFor="consent">
                    Súhlasím so spracovaním osobných údajov
                  </label>
                </div>

                <button type="submit" className="submit-btn">
                  Odoslať
                </button>
              </div>

              <div className="back-link-row">
                <Link to="/" className="back-link">
                  ← Späť na prihlásenie
                </Link>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RegisterForm;
