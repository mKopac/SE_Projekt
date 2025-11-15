import React, { useState, useEffect } from 'react';
import './../css/InternshipForm.css';

interface Company { id: number; name: string; }
interface Mentor { id: number; firstName: string; lastName: string; }
interface Student { id: number; firstName: string; lastName: string; }

interface Internship {
  id: number;
  studentId: number;
  companyId: number;
  mentorId: number | null;
  academicYear: string;
  semester: number;
  dateStart: string;
  dateEnd: string;
}

interface Props {
  onAdd: (internship: Internship) => void;
}

const baseUrl = "http://localhost:8080";

const InternshipForm: React.FC<Props> = ({ onAdd }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  type InternshipFormData = {
    companyId: number;
    mentorId: number;
    academicYear: string;
    semester: number;
    dateStart: string;
    dateEnd: string;
  };

  const [form, setForm] = useState<InternshipFormData>({
    companyId: 0,
    mentorId: 0,
    academicYear: "",
    semester: 1,
    dateStart: "",
    dateEnd: "",
  });

  useEffect(() => {
    // LOAD COMPANIES
    fetch(`${baseUrl}/dashboard/companies`, { headers })
      .then(res => res.ok ? res.json() : [])
      .then(data => setCompanies(Array.isArray(data) ? data : []));

    // LOAD MENTORS
    fetch(`${baseUrl}/dashboard/mentors`, { headers })
      .then(res => res.ok ? res.json() : [])
      .then(data => setMentors(Array.isArray(data) ? data : []));

    // LOAD CURRENT USER
    fetch(`${baseUrl}/auth/me`, { headers })
      .then(res => res.ok ? res.json() : null)
      .then(user => setCurrentUserId(user?.id ?? null));

  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === "semester" ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUserId) {
      alert("Nepodarilo sa načítať používateľa.");
      return;
    }

    const newInternship: Internship = {
      id: Date.now(),
      studentId: currentUserId,
      companyId: form.companyId,
      mentorId: form.mentorId,
      academicYear: form.academicYear,
      semester: form.semester,
      dateStart: form.dateStart,
      dateEnd: form.dateEnd,
    };

    onAdd(newInternship);

    setForm({
      companyId: 0,
      mentorId: 0,
      academicYear: "",
      semester: 1,
      dateStart: "",
      dateEnd: "",
    });
  };

  return (
    <form className="practice-form" onSubmit={handleSubmit}>
      <h3>Nová prax</h3>

      <div className="form-group">
        <label>Firma:</label>
        <select name="companyId" value={form.companyId} onChange={handleChange} required>
          <option value="">-- Vyber firmu --</option>
          {companies.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Mentor:</label>
        <select name="mentorId" value={form.mentorId} onChange={handleChange} required>
          <option value="">-- Vyber mentora --</option>
          {mentors.map(m => (
            <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Akademický rok:</label>
        <input name="academicYear" value={form.academicYear} onChange={handleChange} required />
      </div>

      <div className="form-group">
        <label>Semester:</label>
        <select name="semester" value={form.semester} onChange={handleChange}>
          <option value={1}>1</option>
          <option value={2}>2</option>
        </select>
      </div>

      <div className="date-row">
        <div className="form-group">
          <label>Začiatok:</label>
          <input type="date" name="dateStart" value={form.dateStart} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Koniec:</label>
          <input type="date" name="dateEnd" value={form.dateEnd} onChange={handleChange} required />
        </div>
      </div>

      <button type="submit" className="btn-save">Uložiť prax</button>
    </form>
  );
};

export default InternshipForm;
