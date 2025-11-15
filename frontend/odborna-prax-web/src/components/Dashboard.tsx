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

  // show/hide form
  const [showForm, setShowForm] = useState(false);

  // logged user role
  const [role, setRole] = useState<string>("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Missing authentication token.");
      setLoading(false);
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    // Load user info
    fetch("http://localhost:8080/auth/me", { headers })
      .then(res => res.ok ? res.json() : null)
      .then(user => {
        if (user) setRole(user.role?.name || "");
      });

    // Load internships
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
    setShowForm(false);
  };

  if (loading) return <p>Načítavam dáta...</p>;
  if (error) return <p className="error-text">Chyba: {error}</p>;

  return (
    <div className="dashboard">
      <h2>Prehľad praxí</h2>

      {/* BUTTON PRE ŠTUDENTA */}
      {role === "STUDENT" && (
        <button
          className="dashboard-add-button"
          onClick={() => setShowForm(prev => !prev)}
        >
          {showForm ? "Zavrieť formulár" : "Pridať prax"}
        </button>
      )}

      {/* FORM */}
      {showForm && role === "STUDENT" && (
        <div className="dashboard-form-container">
          <InternshipForm onAdd={handleAddInternship} />
        </div>
      )}

      {/* TABLE */}
      <InternshipTable internships={internships} />
    </div>
  );
};

export default Dashboard;
