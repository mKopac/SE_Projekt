import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { http } from "../api/http";
import { useNavigate } from "react-router-dom";
import "./../css/RegisterForm.css";

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
        const res = await fetch("http://localhost:8080/auth/study-programs");
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
        const res = await fetch("http://localhost:8080/auth/companies"); // endpoint pre všetky firmy
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
      setError("Zadajte meno a priezvisko.");
      return;
    }

    if (!formData.studentEmail) {
      setError("Zadajte e-mail.");
      return;
    }

    if (!formData.consent) {
      setError("Musíte súhlasiť so spracovaním osobných údajov.");
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
            <h2 className="form-title">Registrácia</h2>

            <form className="register-form" onSubmit={handleSubmit} noValidate>
              <div className="form-row">
                <label>Vyberte si typ účtu</label>
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
                      {type}
                    </label>
                  ))}
                </div>
              </div>

              {!isFirma && (
                <div className="form-row">
                  <label>Vyberte študijný odbor</label>
                  <select
                    name="studyProgramId"
                    value={formData.studyProgramId || ""}
                    onChange={handleChange}
                  >
                    <option value="">-- Vyber odbor --</option>
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
                  Meno
                  <input
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    type="text"
                  />
                </label>
                <label>
                  Priezvisko
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
                  <label>Typ firmy</label>
                  <div className="radio-group">
                    <label>
                      <input
                        type="radio"
                        name="firmType"
                        value="existujuca"
                        checked={formData.firmType === "existujuca"}
                        onChange={handleChange}
                      />
                      Existujúca firma
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="firmType"
                        value="nova"
                        checked={formData.firmType === "nova"}
                        onChange={handleChange}
                      />
                      Nová firma
                    </label>
                  </div>
                </div>
              )}

              {isFirma && formData.firmType === "existujuca" && (
                <div className="form-row">
                  <label>Vyberte firmu</label>
                  <select
                    name="companyId"
                    value={formData.companyId || ""}
                    onChange={handleChange}
                  >
                    <option value="">-- Vyber firmu --</option>
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
                    Názov firmy
                    <input
                      name="firmName"
                      value={formData.firmName || ""}
                      onChange={handleChange}
                      type="text"
                    />
                  </label>
                  <label>
                    IČO
                    <input
                      name="ico"
                      value={formData.ico || ""}
                      onChange={handleChange}
                      type="text"
                    />
                  </label>
                  <label>
                    Ulica
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
                Email
                <input
                  name="studentEmail"
                  value={formData.studentEmail}
                  onChange={handleChange}
                  type="email"
                />
              </label>

              {!isFirma && (
                <label>
                  Alternatívny email
                  <input
                    name="altEmail"
                    value={formData.altEmail}
                    onChange={handleChange}
                    type="email"
                  />
                </label>
              )}

              <label>
                Telefón
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  type="tel"
                />
              </label>

              <label>
                Adresa
                <input
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  type="text"
                />
              </label>

              <div className="form-row two-cols">
                <label>
                  Mesto
                  <input
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    type="text"
                  />
                </label>
                <label>
                  PSČ
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
                    Súhlasím so spracovaním osobných údajov
                  </label>
                </div>

                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? "Odosielam..." : "Odoslať"}
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
