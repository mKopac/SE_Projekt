import { useEffect, useState } from "react";
import axios from "axios";
import "../css/Dashboard.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useTranslation } from "react-i18next";

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  suspended: boolean;
}

export default function AdminUserManagement() {
  const { t } = useTranslation("usermgmt");

  const [users, setUsers] = useState<User[]>([]);
  const token = localStorage.getItem("token");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("https://localhost:8443/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error(t("errors.loadUsersConsole"), err);
    }
  };

  const handleSuspend = async (id: number) => {
    await axios.post(
      `https://localhost:8443/api/admin/users/${id}/suspend`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchUsers();
  };

  const handleReactivate = async (id: number) => {
    await axios.post(
      `https://localhost:8443/api/admin/users/${id}/reactivate`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchUsers();
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div>
      <Header />

      <main className="main-content">
        <div className="dashboard-container">
          <h2 className="page-title">{t("title")}</h2>

          <div className="actions-top">
            <button
              className="btn create-admin"
              onClick={() => setShowCreateForm(true)}
            >
              {t("actions.openCreateAdmin")}
            </button>
          </div>

          <div className="table-wrapper">
            <table className="styled-table">
              <thead>
                <tr>
                  <th>{t("table.id")}</th>
                  <th>{t("table.user")}</th>
                  <th>{t("table.email")}</th>
                  <th>{t("table.status")}</th>
                  <th>{t("table.action")}</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>
                      {u.firstName} {u.lastName}
                    </td>
                    <td>{u.email}</td>
                    <td>
                      {u.suspended ? (
                        <span className="status suspended">
                          {t("status.suspended")}
                        </span>
                      ) : (
                        <span className="status active">
                          {t("status.active")}
                        </span>
                      )}
                    </td>
                    <td>
                      {u.suspended ? (
                        <button
                          className="btn reactivate"
                          onClick={() => handleReactivate(u.id)}
                        >
                          {t("actions.reactivate")}
                        </button>
                      ) : (
                        <button
                          className="btn suspend"
                          onClick={() => handleSuspend(u.id)}
                        >
                          {t("actions.suspend")}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {showCreateForm && (
          <div className="create-admin-container">
            <h3>{t("create.title")}</h3>

            <form
              className="create-admin-form"
              onSubmit={async (e) => {
                e.preventDefault();

                const res = await fetch(
                  "https://localhost:8443/auth/register/admin",
                  {
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
                  }
                );

                if (res.ok) {
                  alert(t("alerts.createdOk"));
                  setShowCreateForm(false);
                  fetchUsers();
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
              <label>
                {t("create.fields.firstName")}
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </label>

              <label>
                {t("create.fields.lastName")}
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </label>

              <label>
                {t("create.fields.email")}
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </label>

              <label>
                {t("create.fields.phoneNumber")}
                <input
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </label>

              <div className="form-buttons">
                <button type="submit" className="btn create">
                  {t("create.actions.create")}
                </button>
                <button
                  type="button"
                  className="btn cancel"
                  onClick={() => setShowCreateForm(false)}
                >
                  {t("create.actions.cancel")}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
