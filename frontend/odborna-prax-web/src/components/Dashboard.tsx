import React, { useState, useEffect } from "react";
import InternshipTable from "./InternshipTable";
import InternshipForm from "../forms/InternshipForm";
import "./../css/Dashboard.css";

interface InternshipDTO {
  id: number;
  studentId: number;
  companyId: number;
  mentorId: number | null;
  academicYear: string;
  semester: number;
  dateStart: string;
  dateEnd: string;
}

const Dashboard: React.FC = () => {
  const [internships, setInternships] = useState<InternshipDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [role, setRole] = useState<string>("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Missing authentication token.");
      setLoading(false);
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    fetch("http://localhost:8080/auth/me", { headers })
      .then(res => res.ok ? res.json() : null)
      .then(user => {
        if (user) setRole(user.role?.name || "");
      });

    fetch("http://localhost:8080/dashboard/internships", { headers })
      .then(async res => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error("Backend error: " + text);
        }
        return res.json();
      })
      .then(data => {
        const extracted = data.map((item: any) => item.internship);
        setInternships(extracted);
      })
      .catch(err => {
        console.error("Error loading internships:", err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleAddInternship = (i: InternshipDTO) => {
    setInternships(prev => [...prev, i]);
    setShowModal(false);
  };

  if (loading) return <p>Načítavam dáta...</p>;
  if (error) return <p className="error-text">Chyba: {error}</p>;

  return (
    <div className="dashboard">
      <h2>Prehľad praxí</h2>

      {role === "STUDENT" && (
        <button className="add-button" onClick={() => setShowModal(true)}>
          Pridať prax
        </button>
      )}

      {/* === MODAL === */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button
              className="close-button"
              onClick={() => setShowModal(false)}
            >
              ×
            </button>

            <InternshipForm onAdd={handleAddInternship} />
          </div>
        </div>
      )}

      <InternshipTable internships={internships} />
    </div>
  );
};

export default Dashboard;
