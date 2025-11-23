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
  description?: string; // ← PRIDANÉ
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
    description: string;
  };

  const [form, setForm] = useState<InternshipFormData>({
    companyId: 0,
    mentorId: 0,
    academicYear: "",
    semester: 1,
    dateStart: "",
    dateEnd: "",
    description: "",
  });

  useEffect(() => {
    fetch(`${baseUrl}/dashboard/companies`, { headers })
      .then(res => res.ok ? res.json() : [])
      .then(data => setCompanies(Array.isArray(data) ? data : []));

    fetch(`${baseUrl}/dashboard/mentors`, { headers })
      .then(res => res.ok ? res.json() : [])
      .then(data => setMentors(Array.isArray(data) ? data : []));

    fetch(`${baseUrl}/auth/me`, { headers })
      .then(res => res.ok ? res.json() : null)
      .then(user => setCurrentUserId(user?.id ?? null));

    const now = new Date();
    let startYear: number;
    let endYear: number;
    if (now.getMonth() >= 8) {
      startYear = now.getFullYear();
      endYear = startYear + 1;
    } else {
      endYear = now.getFullYear();
      startYear = endYear - 1;
    }
    setForm(prev => ({ ...prev, academicYear: `${startYear}/${endYear}` }));

  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> // ← PRIDANÉ
  ) => {
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

    const payload = {
      companyId: form.companyId,
      mentorId: form.mentorId === 0 ? null : form.mentorId,
      academicYear: form.academicYear,
      semester: form.semester,
      dateStart: form.dateStart,
      dateEnd: form.dateEnd,
      description: form.description,
    };

    const res = await fetch(`${baseUrl}/dashboard/internship`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      alert("Chyba pri ukladaní praxe: " + (data.error ?? "Neznáma chyba"));
      return;
    }

    alert("Prax bola úspešne vytvorená!");

    onAdd({
      id: data.internshipId,
      studentId: currentUserId,
      companyId: form.companyId,
      mentorId: form.mentorId ?? null,
      academicYear: form.academicYear,
      semester: form.semester,
      dateStart: form.dateStart,
      dateEnd: form.dateEnd,
      description: form.description,
    });

    setForm({
      companyId: 0,
      mentorId: 0,
      academicYear: "",
      semester: 1,
      dateStart: "",
      dateEnd: "",
      description: "",
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
        <input name="academicYear" value={form.academicYear} onChange={handleChange} required readOnly/>
      </div>

      <div className="form-group">
        <label>Semester:</label>
        <select name="semester" value={form.semester} onChange={handleChange}>
          <option value={1}>1</option>
          <option value={2}>2</option>
          <option value={3}>3</option>
          <option value={4}>4</option>
          <option value={5}>5</option>
          <option value={6}>6</option>
          <option value={7}>7</option>
          <option value={8}>8</option>
          <option value={9}>9</option>
          <option value={10}>10</option>
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

      <div className="form-group">
        <label>Popis:</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={3}
        ></textarea>
      </div>

      <button type="submit" className="btn-save">Uložiť prax</button>
    </form>
  );
};

export default InternshipForm;
