import React, { useEffect, useState } from "react";
import "./../css/Profile.css";

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  emailAlternate?: string;
  phoneNumber: string;
  address?: string;
  city?: string;
  zip?: string;
  role?: string;
  studyProgram?: string;
  companyName?: string;
}

interface StudyProgram {
  id: number;
  name: string;
}

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [fieldValue, setFieldValue] = useState<string>("");
  const [message, setMessage] = useState<string | null>(null);
  const [studyPrograms, setStudyPrograms] = useState<StudyProgram[]>([]);

  // Stav pre zmenu hesla
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);

  // Načítanie profilu používateľa
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:8080/account/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Chyba pri načítavaní profilu");
        const data = await res.json();
        setProfile(data);
      } catch (error: any) {
        setMessage(error.message);
      }
    };
    fetchProfile();
  }, []);

  // Načítanie zoznamu študijných odborov
  useEffect(() => {
    const fetchStudyPrograms = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:8080/account/study-programs", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Chyba pri načítavaní študijných odborov");
        const data = await res.json();
        setStudyPrograms(data);
      } catch (error) {
        console.error("Fetch study programs failed:", error);
      }
    };
    fetchStudyPrograms();
  }, []);

  // Kliknutie na "Upraviť"
  const handleEditClick = (field: keyof UserProfile) => {
    if (!profile) return;
    setEditingField(field);
    setFieldValue(profile[field] || "");
  };

  // Uloženie zmeny
  const handleFieldSave = async () => {
    if (!profile || !editingField) return;

    const updated = { ...profile, [editingField]: fieldValue };
    setProfile(updated);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8080/account/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ [editingField]: fieldValue }),
      });

      if (!res.ok) throw new Error("Chyba pri ukladaní zmien");
      setMessage("Údaje boli úspešne uložené.");
    } catch (error: any) {
      setMessage(error.message);
    }

    setEditingField(null);
  };

  // Odoslanie formulára pre zmenu hesla
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setPasswordMessage("Nové heslá sa nezhodujú.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8080/account/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          oldPassword,
          newPassword,
        }),
      });

      if (!res.ok) throw new Error("Nepodarilo sa zmeniť heslo.");
      setPasswordMessage("Heslo bolo úspešne zmenené.");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      setPasswordMessage(error.message);
    }
  };

  if (!profile) return <p>Načítavam profil...</p>;

  // Popisky pre jednotlivé polia
  const labels: Record<keyof UserProfile, string> = {
    firstName: "Meno",
    lastName: "Priezvisko",
    email: "Email (nemenný)",
    emailAlternate: "Alternatívny email",
    phoneNumber: "Telefón",
    address: "Adresa",
    city: "Mesto",
    zip: "PSČ",
    role: "Typ účtu",
    studyProgram: "Študijný program",
    companyName: "Názov firmy",
  };

  // Polia, ktoré nie je možné editovať
  const readOnlyFields: (keyof UserProfile)[] = ["email", "role"];

  // Definovanie poradia polí pre každý typ účtu
  const fieldOrderByRole: Record<string, (keyof UserProfile)[]> = {
    STUDENT: [
      "firstName",
      "lastName",
      "role",
      "studyProgram",
      "email",
      "emailAlternate",
      "phoneNumber",
      "address",
      "city",
      "zip",
    ],
    COMPANY: [
      "firstName",
      "lastName",
      "role",
      "companyName",
      "email",
      "emailAlternate",
      "phoneNumber",
    ],
    ADMIN: [
      "firstName",
      "lastName",
      "role",
      "email",
      "emailAlternate",
      "phoneNumber",
    ],
  };

  // Zistenie rolového poradia (fallback na ADMIN)
  const userRole = profile.role?.toUpperCase() || "ADMIN";
  const fieldsToShow = fieldOrderByRole[userRole] || fieldOrderByRole["ADMIN"];

  return (
    <div className="profile-wrapper">
      <div className="profile-container-wide">
        <h2>Môj profil</h2>
        {message && <div className="profile-message">{message}</div>}

        <div className="profile-grid">
          {fieldsToShow.map((key) => {
            const value = profile[key];
            const isReadOnly = readOnlyFields.includes(key);

            return (
              <div
                key={key}
                className={`profile-grid-item ${isReadOnly ? "readonly-field" : ""}`}
              >
                <strong>{labels[key] || key}:</strong>

                {editingField === key ? (
                  <span className="edit-field">
                    {key === "studyProgram" ? (
                      <select
                        value={fieldValue || ""}
                        onChange={(e) => setFieldValue(e.target.value)}
                      >
                        <option value="">-- Vyber odbor --</option>
                        {studyPrograms.map((program) => (
                          <option key={program.id} value={program.name}>
                            {program.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        value={fieldValue}
                        onChange={(e) => setFieldValue(e.target.value)}
                        autoFocus
                      />
                    )}

                    <button className="save-btn" onClick={handleFieldSave}>
                      💾
                    </button>
                    <button
                      className="cancel-btn"
                      onClick={() => setEditingField(null)}
                    >
                      ✖
                    </button>
                  </span>
                ) : (
                  <>
                    <span>{value || "—"}</span>
                    {!isReadOnly && (
                      <button
                        className="edit-btn"
                        title="Upraviť"
                        onClick={() => handleEditClick(key)}
                      >
                        ✏️
                      </button>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Sekcia pre zmenu hesla */}
        <div className="password-section">
          <h3>Zmena hesla</h3>
          {passwordMessage && <div className="profile-message">{passwordMessage}</div>}
          <form onSubmit={handlePasswordChange} className="password-form">
            <div className="form-group">
              <label>Staré heslo:</label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Nové heslo:</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Potvrdenie hesla:</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="password-save-btn">
              Zmeniť heslo
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
