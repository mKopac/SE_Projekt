import React, { useState, useEffect } from 'react';
import type { Practice } from '../types/Practice';
import './../css/PracticeForm.css';

interface Company {
  id: number;
  name: string;
}

interface Supervisor {
  id: number;
  lastName: string;
}

interface Props {
  onAdd: (practice: Practice) => void;
}

const PracticeForm: React.FC<Props> = ({ onAdd }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);

  // Študent sa určí podľa prihláseného používateľa (napr. z tokenu)
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  const [form, setForm] = useState<Omit<Practice, 'id'>>({
    companyId: 0,
    supervisorId: 0,
    startDate: '',
    endDate: '',
    description: '',
    status: 'Vytvorená',
  });

  useEffect(() => {
    fetch('/api/companies')
      .then(res => res.json())
      .then(setCompanies)
      .catch(err => console.error('Chyba pri načítaní firiem:', err));

    fetch('/api/supervisors')
      .then(res => res.json())
      .then(setSupervisors)
      .catch(err => console.error('Chyba pri načítaní školiteľov:', err));

    // simulácia načítania aktuálneho používateľa (z localStorage alebo backendu)
    fetch('/api/me')
      .then(res => res.json())
      .then(user => setCurrentUserId(user.id))
      .catch(() => console.warn('Nepodarilo sa získať prihláseného používateľa.'));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUserId) {
      alert('Nepodarilo sa určiť prihláseného používateľa.');
      return;
    }

    const newPractice: Practice = {
      id: Date.now(),
      studentId: currentUserId,
      ...form,
    };

    onAdd(newPractice);

    setForm({
      companyId: 0,
      supervisorId: 0,
      startDate: '',
      endDate: '',
      description: '',
      status: 'Vytvorená',
    });
  };

  return (
    <form className="practice-form" onSubmit={handleSubmit}>
      <h3>Nová prax</h3>

      <div className="form-group">
        <label>Názov firmy:</label>
        <select
          name="companyId"
          value={form.companyId}
          onChange={handleChange}
          required
        >
          <option value="">-- Vyber firmu --</option>
          {companies.map(c => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Školiteľ praxe:</label>
        <select
          name="supervisorId"
          value={form.supervisorId}
          onChange={handleChange}
          required
        >
          <option value="">-- Vyber školiteľa --</option>
          {supervisors.map(s => (
            <option key={s.id} value={s.id}>
              {s.lastName}
            </option>
          ))}
        </select>
      </div>

      <div className="date-row">
        <div className="form-group">
          <label>Začiatok:</label>
          <input
            type="date"
            name="startDate"
            value={form.startDate}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Koniec:</label>
          <input
            type="date"
            name="endDate"
            value={form.endDate}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label>Popis praxe:</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={3}
          placeholder="Krátky popis praxe..."
        />
      </div>

      <button type="submit" className="btn-save">
        Uložiť prax
      </button>
    </form>
  );
};

export default PracticeForm;
