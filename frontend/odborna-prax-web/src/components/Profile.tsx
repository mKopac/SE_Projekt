import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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
  department?: string;
  companyName?: string;
}

interface StudyProgram {
  id: number;
  name: string;
}

interface Department {
  id: number;
  name: string;
}

const Profile: React.FC = () => {
  const { t } = useTranslation("profile");

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [fieldValue, setFieldValue] = useState<string>("");
  const [message, setMessage] = useState<string | null>(null);
  const [studyPrograms, setStudyPrograms] = useState<StudyProgram[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);

  // Načítanie profilu používateľa
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("https://localhost:8443/account/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(t("errors.profileLoad"));
        const data = await res.json();
        setProfile(data);
      } catch (error: any) {
        setMessage(error.message);
      }
    };
    fetchProfile();
  }, [t]);

  // Načítanie študijných programov
  useEffect(() => {
    const fetchStudyPrograms = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("https://localhost:8443/account/study-programs", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(t("errors.studyProgramsLoad"));
        const data = await res.json();
        setStudyPrograms(data);
      } catch (error) {
        console.error("Fetch study programs failed:", error);
      }
    };
    fetchStudyPrograms();
  }, [t]);

  // Načítanie katedier
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("https://localhost:8443/account/departments", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(t("errors.departmentsLoad"));
        const data = await res.json();
        setDepartments(data);
      } catch (error) {
        console.error("Fetch departments failed:", error);
      }
    };
    fetchDepartments();
  }, [t]);

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
      const res = await fetch("https://localhost:8443/account/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ [editingField]: fieldValue }),
      });

      if (!res.ok) throw new Error(t("errors.saveChanges"));
      setMessage(t("messages.savedOk"));
    } catch (error: any) {
      setMessage(error.message);
    }

    setEditingField(null);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setPasswordMessage(t("password.errors.mismatch"));
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("https://localhost:8443/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: oldPassword,
          newPassword: newPassword,
          repeatNewPassword: confirmPassword,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || t("password.errors.changeFailed"));
      }

      setPasswordMessage(t("password.messages.changedOk"));
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      setPasswordMessage(error.message);
    }
  };

  if (!profile) return <p>{t("loading.profile")}</p>;

  const labels: Record<keyof UserProfile, string> = {
    firstName: t("labels.firstName"),
    lastName: t("labels.lastName"),
    email: t("labels.email"),
    emailAlternate: t("labels.emailAlternate"),
    phoneNumber: t("labels.phoneNumber"),
    address: t("labels.address"),
    city: t("labels.city"),
    zip: t("labels.zip"),
    role: t("labels.role"),
    studyProgram: t("labels.studyProgram"),
    department: t("labels.department"),
    companyName: t("labels.companyName"),
  };

  const readOnlyFields: (keyof UserProfile)[] = ["email", "role"];

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
      "department",
      "email",
      "emailAlternate",
      "phoneNumber",
    ],
  };

  const userRole = profile.role?.toUpperCase() || "ADMIN";
  const fieldsToShow = fieldOrderByRole[userRole] || fieldOrderByRole["ADMIN"];

  return (
    <div className="profile-wrapper">
      <div className="profile-container-wide">
        <h2>{t("title")}</h2>
        {message && <div className="profile-message">{message}</div>}

        <div className="profile-grid">
          {fieldsToShow.map((key) => {
            const value = profile[key];
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
                    {key === "studyProgram" ? (
                      <select
                        value={fieldValue || ""}
                        onChange={(e) => setFieldValue(e.target.value)}
                      >
                        <option value="">{t("select.studyProgram")}</option>
                        {studyPrograms.map((program) => (
                          <option key={program.id} value={program.name}>
                            {program.name}
                          </option>
                        ))}
                      </select>
                    ) : key === "department" ? (
                      <select
                        value={fieldValue || ""}
                        onChange={(e) => setFieldValue(e.target.value)}
                      >
                        <option value="">{t("select.department")}</option>
                        {departments.map((dep) => (
                          <option key={dep.id} value={dep.name}>
                            {dep.name}
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
                    <span>{value || t("common.empty")}</span>
                    {!isReadOnly && (
                      <button
                        className="edit-btn"
                        title={t("actions.edit")}
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

        <div className="password-section">
          <h3>{t("password.title")}</h3>
          {passwordMessage && (
            <div className="profile-message">{passwordMessage}</div>
          )}
          <form onSubmit={handlePasswordChange} className="password-form">
            <div className="form-group">
              <label>{t("password.fields.old.label")}</label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>{t("password.fields.new.label")}</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>{t("password.fields.confirm.label")}</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="password-save-btn">
              {t("password.actions.submit")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
