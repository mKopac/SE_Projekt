import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { http } from "../api/http";
import { useNavigate } from "react-router-dom";
import "./../css/RegisterForm.css";
import { useTranslation } from "react-i18next";

export type RegisterFormData = {
  accountType: "Študent" | "Firma";
  firmType: "" | "existujuca" | "nova";
  companyId?: number;   
  firmName?: string;    
  ico?: string;         
  street?: string;     
  studyProgramId?: number;  
  firstName: string;
  lastName: string;
  studentEmail: string;
  altEmail?: string;
  phone: string;
  address: string;
  city: string;
  zip: string;
  consent: boolean;
};

type Props = {
  onSubmit?: (formData: RegisterFormData) => void;
};

interface StudyProgram {
  id: number;
  name: string;
}

interface Company {
  id: number;
  name: string;
}

export const RegisterForm: React.FC<Props> = ({ onSubmit }) => {
  const { t } = useTranslation("login");
  const [formData, setFormData] = useState<RegisterFormData>({
    accountType: "Študent",
    firmType: "existujuca",
    companyId: undefined,
    firmName: "",
    ico: "",
    street: "",
    studyProgramId: undefined,
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

  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [studyPrograms, setStudyPrograms] = useState<StudyProgram[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, type, value } = e.target;
    const newValue =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "select-one" && (name === "studyProgramId" || name === "companyId")
        ? Number(value) || undefined
        : newValue,
    }));
  };

  // Načítanie študijných programov
  useEffect(() => {
    const fetchStudyPrograms = async () => {
      try {
        const res = await fetch("https://localhost:8443/auth/study-programs");
        if (!res.ok) throw new Error("Chyba pri načítavaní študijných odborov");
        const data = await res.json();
        setStudyPrograms(data);
      } catch (error) {
        console.error("Fetch study programs failed:", error);
      }
    };
    fetchStudyPrograms();
  }, []);

  // Načítanie existujúcich firiem
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await fetch("https://localhost:8443/auth/companies");
        if (!res.ok) throw new Error("Chyba pri načítavaní firiem");
        const data = await res.json();
        setCompanies(data);
      } catch (error) {
        console.error("Fetch companies failed:", error);
      }
    };
    fetchCompanies();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.firstName || !formData.lastName) {
      setError(t("registerForm.errors.nameRequired"));
      return;
    }

    if (!formData.studentEmail) {
      setError(t("registerForm.errors.emailRequired"));
      return;
    }

    // Validácia pre študentský e-mail
    if (formData.accountType === "Študent" && !formData.studentEmail.endsWith("@student.ukf.sk")) {
      setError(t("registerForm.errors.invalidStudentEmail"));
      return;
    }

    if (!formData.consent) {
      setError(t("registerForm.consent.requiredError"));
      return;
    }

    setLoading(true);

    try {
      if (formData.accountType === "Študent") {
        const payload = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          studentEmail: formData.studentEmail,
          emailAlternate: formData.altEmail,
          phoneNumber: formData.phone,
          address: formData.address,
          city: formData.city,
          zip: formData.zip,
          fieldOfStudyId: formData.studyProgramId,
        };

        await http.post("/auth/register/student", payload);
        navigate("/login?registered=success");
      } else if (formData.accountType === "Firma") {
        const payload = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          studentEmail: formData.studentEmail,
          emailAlternate: formData.altEmail,
          phoneNumber: formData.phone,
          firmType: formData.firmType,
          companyId: formData.firmType === "existujuca" ? formData.companyId : undefined,
          companyName: formData.firmType === "nova" ? formData.firmName : undefined,
          companyIdentificationNumber: formData.firmType === "nova" ? formData.ico : undefined,
          address: formData.address,
          street: formData.street,
          city: formData.city,
          zip: formData.zip,
        };

        await http.post("/auth/register/company", payload);
        navigate("/login?registered=success");
      }

      if (onSubmit) {
        onSubmit(formData);
      }
    } catch (err: any) {
      console.error(err);
      setError("Registrácia zlyhala. Skontrolujte údaje alebo skúste neskôr.");
    } finally {
      setLoading(false);
    }
  };

  const isFirma = formData.accountType === "Firma";

  return (
    <div className="page-root">
      <Header />

      <main className="main-content">
        <div className="login-box-outer register-outer">
          <div className="login-box register-box">
            <h2 className="form-title">{t("registerForm.title")}</h2>

            <form className="register-form" onSubmit={handleSubmit} noValidate>
              <div className="form-row">
                <label>{t("registerForm.accountType.label")}</label>
                <div className="radio-group">
                  {["Študent", "Firma"].map((type) => (
                    <label key={type}>
                      <input
                        type="radio"
                        name="accountType"
                        value={type}
                        checked={formData.accountType === type}
                        onChange={handleChange}
                      />
                      {type === "Študent"
                        ? t("registerForm.accountType.student")
                        : t("registerForm.accountType.company")}
                    </label>
                  ))}
                </div>
              </div>

              {!isFirma && (
                <div className="form-row">
                  <label>{t("registerForm.studyProgram.label")}</label>
                  <select
                    name="studyProgramId"
                    value={formData.studyProgramId || ""}
                    onChange={handleChange}
                  >
                    <option value="">
                      {t("registerForm.studyProgram.placeholder")}
                    </option>
                    {studyPrograms.map((program) => (
                      <option key={program.id} value={program.id}>
                        {program.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-row two-cols">
                <label>
                  {t("registerForm.personal.firstName")}
                  <input
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    type="text"
                  />
                </label>
                <label>
                  {t("registerForm.personal.lastName")}
                  <input
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    type="text"
                  />
                </label>
              </div>

              {isFirma && (
                <div className="form-row">
                  <label>{t("registerForm.company.firmType")}</label>
                  <div className="radio-group">
                    <label>
                      <input
                        type="radio"
                        name="firmType"
                        value="existujuca"
                        checked={formData.firmType === "existujuca"}
                        onChange={handleChange}
                      />
                      {t("registerForm.company.existing")}
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="firmType"
                        value="nova"
                        checked={formData.firmType === "nova"}
                        onChange={handleChange}
                      />
                      {t("registerForm.company.new")}
                    </label>
                  </div>
                </div>
              )}

              {isFirma && formData.firmType === "existujuca" && (
                <div className="form-row">
                  <label>{t("registerForm.company.selectCompany")}</label>
                  <select
                    name="companyId"
                    value={formData.companyId || ""}
                    onChange={handleChange}
                  >
                    <option value="">
                      {t("registerForm.company.selectPlaceholder")}
                    </option>
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {isFirma && formData.firmType === "nova" && (
                <>
                  <label>
                    {t("registerForm.company.name")}
                    <input
                      name="firmName"
                      value={formData.firmName || ""}
                      onChange={handleChange}
                      type="text"
                    />
                  </label>
                  <label>
                    {t("registerForm.company.ico")}
                    <input
                      name="ico"
                      value={formData.ico || ""}
                      onChange={handleChange}
                      type="text"
                    />
                  </label>
                  <label>
                    {t("registerForm.company.street")}
                    <input
                      name="street"
                      value={formData.street || ""}
                      onChange={handleChange}
                      type="text"
                    />
                  </label>
                </>
              )}

              <label>
                {t("registerForm.contact.email")}
                <input
                  name="studentEmail"
                  value={formData.studentEmail}
                  onChange={handleChange}
                  type="email"
                />
              </label>

              {!isFirma && (
                <label>
                  {t("registerForm.contact.altEmail")}
                  <input
                    name="altEmail"
                    value={formData.altEmail}
                    onChange={handleChange}
                    type="email"
                  />
                </label>
              )}

              <label>
                {t("registerForm.contact.phone")}
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  type="tel"
                />
              </label>

              <label>
                {t("registerForm.contact.address")}
                <input
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  type="text"
                />
              </label>

              <div className="form-row two-cols">
                <label>
                  {t("registerForm.contact.city")}
                  <input
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    type="text"
                  />
                </label>
                <label>
                  {t("registerForm.contact.zip")}
                  <input
                    name="zip"
                    value={formData.zip}
                    onChange={handleChange}
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
                    {t("registerForm.consent.label")}
                  </label>
                </div>

                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading
                    ? t("registerForm.submit.loading")
                    : t("registerForm.submit.default")}
                </button>
              </div>

              <div className="back-link-row">
                <Link to="/" className="back-link">
                  {t("registerForm.back")}
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
