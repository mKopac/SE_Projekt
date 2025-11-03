import React, { useEffect, useState } from "react";
import "./../css/Profile.css";

interface UserProfile {
  accountType: string;
  studyProgram?: string;
  firstName: string;
  lastName: string;
  studentEmail: string;
  altEmail?: string;
  phone: string;
  address: string;
  city: string;
  zip: string;
}

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [fieldValue, setFieldValue] = useState<string>("");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    // Dummy user data (temporary)
    const dummyUser: UserProfile = {
      accountType: "Študent",
      studyProgram: "AI22m",
      firstName: "Testerovič",
      lastName: "Testenko",
      studentEmail: "testerovic.testenko@student.ukf.sk",
      altEmail: "testerovic@testenko.com",
      phone: "0910123456",
      address: "Nitra 1",
      city: "Nitra",
      zip: "98801",
    };
    setProfile(dummyUser);
  }, []);

  const handleEditClick = (field: keyof UserProfile) => {
    if (!profile) return;
    setEditingField(field);
    setFieldValue(profile[field] || "");
  };

  const handleFieldSave = () => {
    if (!profile || !editingField) return;
    const updated = { ...profile, [editingField]: fieldValue };
    setProfile(updated);
    setEditingField(null);
    setMessage("Údaje boli aktualizované (lokálne).");
  };

  if (!profile) return <p>Načítavam profil...</p>;

  const labels: Record<keyof UserProfile, string> = {
    accountType: "Typ účtu",
    studyProgram: "Študijný program",
    firstName: "Meno",
    lastName: "Priezvisko",
    studentEmail: "Email",
    altEmail: "Alternatívny email",
    phone: "Telefón",
    address: "Adresa",
    city: "Mesto",
    zip: "PSČ",
  };

  // Fields that cannot be edited
  const readOnlyFields: (keyof UserProfile)[] = [
    "accountType",
    "studyProgram",
    "studentEmail",
  ];

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
