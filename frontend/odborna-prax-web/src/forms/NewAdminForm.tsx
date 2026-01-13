import React from "react";
import "../css/NewAdminForm.css";
import { useTranslation } from "react-i18next";

type Props = {
  token: string | null;
  firstName: string;
  setFirstName: React.Dispatch<React.SetStateAction<string>>;
  lastName: string;
  setLastName: React.Dispatch<React.SetStateAction<string>>;
  email: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  phoneNumber: string;
  setPhoneNumber: React.Dispatch<React.SetStateAction<string>>;
  onClose: () => void;
  onCreated: () => void;
};

const NewAdminForm: React.FC<Props> = ({
  token,
  firstName,
  setFirstName,
  lastName,
  setLastName,
  email,
  setEmail,
  phoneNumber,
  setPhoneNumber,
  onClose,
  onCreated,
}) => {
  const { t } = useTranslation("usermgmt");

  return (
    <div
      className="new-admin-modal-overlay"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="new-admin-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <form
          className="new-admin-form"
          onSubmit={async (e) => {
            e.preventDefault();

            const res = await fetch("https://localhost:8443/auth/register/admin", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                firstName,
                lastName,
                email,
                phoneNumber,
              }),
            });

            if (res.ok) {
              alert(t("alerts.createdOk"));
              onClose();
              onCreated();
            } else {
              let errorMessage = t("alerts.createFailed");

              try {
                const err = await res.json();
                errorMessage = err.message || err.error || errorMessage;
              } catch (_) {}

              alert(errorMessage);
            }
          }}
        >
          <h3>{t("create.title")}</h3>

          <div className="new-admin-form-group">
            <label>{t("create.fields.firstName")}</label>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>

          <div className="new-admin-form-group">
            <label>{t("create.fields.lastName")}</label>
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>

          <div className="new-admin-form-group">
            <label>{t("create.fields.email")}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="new-admin-form-group">
            <label>{t("create.fields.phoneNumber")}</label>
            <input
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>

          <div className="new-admin-form-buttons">
            <button type="submit" className="new-admin-btn-save">
              {t("create.actions.create")}
            </button>
            <button
              type="button"
              className="new-admin-btn-cancel"
              onClick={onClose}
            >
              {t("create.actions.cancel")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewAdminForm;
