import { useEffect, useState } from "react";
import axios from "axios";
import "../css/Dashboard.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  suspended: boolean;
}

export default function AdminUserManagement() {
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
      console.error("Chyba pri načítaní používateľov:", err);
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
    <div>
      <Header />

      <main className="main-content">
        <div className="dashboard-container">
          <h2 className="page-title">Správa používateľov</h2>

          <div className="actions-top">
            <button
              className="btn create-admin"
              onClick={() => setShowCreateForm(true)}
            >
              + Vytvoriť admina
            </button>
          </div>

          <div className="table-wrapper">
            <table className="styled-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Používateľ</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Akcia</th>
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
                        <span className="status suspended">Pozastavený</span>
                      ) : (
                        <span className="status active">Aktívny</span>
                      )}
                    </td>
                    <td>
                      {u.suspended ? (
                        <button
                          className="btn reactivate"
                          onClick={() => handleReactivate(u.id)}
                        >
                          Reaktivovať
                        </button>
                      ) : (
                        <button
                          className="btn suspend"
                          onClick={() => handleSuspend(u.id)}
                        >
                          Pozastaviť
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
            <h3>Vytvoriť admin účet</h3>

            <form
              className="create-admin-form"
              onSubmit={async (e) => {
                e.preventDefault();

                const res = await fetch(
                  "http://localhost:8080/auth/register/admin",
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
                  alert("Admin účet bol vytvorený. Overovací email bol odoslaný.");
                  setShowCreateForm(false);
                  fetchUsers();
                } else {
                  let errorMessage = "Chyba pri vytváraní admina.";

                  try {
                    const err = await res.json();
                    errorMessage = err.message || err.error || errorMessage;
                  } catch (_) {}

                  alert(errorMessage);
                }
              }}
            >
              <label>
                Meno
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </label>

              <label>
                Priezvisko
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </label>

              <label>
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </label>

              <label>
                Telefónne číslo
                <input
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </label>

              <div className="form-buttons">
                <button type="submit" className="btn create">
                  Vytvoriť
                </button>
                <button
                  type="button"
                  className="btn cancel"
                  onClick={() => setShowCreateForm(false)}
                >
                  Zrušiť
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
