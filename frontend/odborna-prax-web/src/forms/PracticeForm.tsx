import React, { useState } from 'react';
import type { Practice } from '../components/Dashboard';
import './../css/PracticeForm.css';

interface Props {
  onAdd: (practice: Practice) => void;
}

const PracticeForm: React.FC<Props> = ({ onAdd }) => {
  const [form, setForm] = useState({
    studentName: '',
    company: '',
    startDate: '',
    endDate: '',
    description: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newPractice: Practice = {
      ...form,
      id: Date.now(),
    };
    onAdd(newPractice);
    setForm({ studentName: '', company: '', startDate: '', endDate: '', description: '' });
  };

  return (
    <form className="practice-form" onSubmit={handleSubmit}>
      <h3>Nová prax</h3>
      <label>
        Meno študenta
        <input name="studentName" value={form.studentName} onChange={handleChange} required />
      </label>
      <label>
        Firma
        <input name="company" value={form.company} onChange={handleChange} required />
      </label>
      <div className="date-group">
        <label>
          Začiatok
          <input type="date" name="startDate" value={form.startDate} onChange={handleChange} required />
        </label>
        <label>
          Koniec
          <input type="date" name="endDate" value={form.endDate} onChange={handleChange} required />
        </label>
      </div>
      <label>
        Popis praxe
        <textarea name="description" value={form.description} onChange={handleChange} />
      </label>
      <button type="submit">Uložiť prax</button>
    </form>
  );
};

export default PracticeForm;
