import { useEffect, useState } from "react";
import axios from "axios";
import "../css/Dashboard.css";
import "../css/AdminManagement.css";
import { useTranslation } from "react-i18next";
import NewAdminForm from "./NewAdminForm";

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  suspended: boolean;
}

export default function UserManagementTable() {
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
      const res = await axios.get("http://localhost:8080/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error(t("errors.loadUsersConsole"), err);
    }
  };

  const handleSuspend = async (id: number) => {
    await axios.post(
      `http://localhost:8080/api/admin/users/${id}/suspend`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchUsers();
  };

  const handleReactivate = async (id: number) => {
    await axios.post(
      `http://localhost:8080/api/admin/users/${id}/reactivate`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchUsers();
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
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

        <div className="table-card">
          <table className="dashboard-table">
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
        <NewAdminForm
          token={token}
          firstName={firstName}
          setFirstName={setFirstName}
          lastName={lastName}
          setLastName={setLastName}
          email={email}
          setEmail={setEmail}
          phoneNumber={phoneNumber}
          setPhoneNumber={setPhoneNumber}
          onClose={() => setShowCreateForm(false)}
          onCreated={fetchUsers}
        />
      )}
    </main>
  );
}
