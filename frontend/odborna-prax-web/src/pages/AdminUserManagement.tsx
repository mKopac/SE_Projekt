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
    <div >
      <Header />

      <main className="main-content">
        <div className="dashboard-container">
          <h2 className="page-title">Správa používateľov</h2>

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
                    <td>{u.firstName} {u.lastName}</td>
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

{/*
           {users.length === 0 && (
               
               <p className="no-data">Žiadny používatelia na zobrazenie.</p>
            )}
      */  } 
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
