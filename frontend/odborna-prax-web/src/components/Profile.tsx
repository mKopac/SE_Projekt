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
}

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [fieldValue, setFieldValue] = useState<string>("");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:8080/account/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
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

  const handleEditClick = (field: keyof UserProfile) => {
    if (!profile) return;
    setEditingField(field);
    setFieldValue(profile[field] || "");
  };

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

  if (!profile) return <p>Načítavam profil...</p>;

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
  };

  const readOnlyFields: (keyof UserProfile)[] = ["email", "role", "studyProgram"];

  return (
    <div className="profile-wrapper">
      <div className="profile-container-wide">
        <h2>Môj profil</h2>
        {message && <div className="profile-message">{message}</div>}

        <div className="profile-grid">
          {(Object.entries(profile) as [keyof UserProfile, string | undefined][]).map(
            ([key, value]) => {
              const isReadOnly = readOnlyFields.includes(key);

              return (
                <div
                  key={key}
                  className={`profile-grid-item ${
                    isReadOnly ? "readonly-field" : ""
                  }`}
                >
                  <strong>{labels[key] || key}:</strong>
                  {editingField === key ? (
                    <span className="edit-field">
                      <input
                        value={fieldValue}
                        onChange={(e) => setFieldValue(e.target.value)}
                        autoFocus
                      />
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
            }
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
