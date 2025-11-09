import React, { useEffect, useState } from 'react';
import type { Practice } from '../types/Practice';
import './../css/PracticeTable.css';

interface Company {
  id: number;
  name: string;
}

interface Supervisor {
  id: number;
  lastName: string;
}

interface Student {
  id: number;
  firstName: string;
  lastName: string;
}

interface Props {
  practices: Practice[];
}

const PracticeTable: React.FC<Props> = ({ practices }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    // 🔄 Načítanie dát z backendu
    fetch('/api/companies')
      .then(res => res.json())
      .then(setCompanies)
      .catch(err => console.error('Chyba pri načítaní firiem:', err));

    fetch('/api/supervisors')
      .then(res => res.json())
      .then(setSupervisors)
      .catch(err => console.error('Chyba pri načítaní školiteľov:', err));

    fetch('/api/students')
      .then(res => res.json())
      .then(setStudents)
      .catch(err => console.error('Chyba pri načítaní študentov:', err));
  }, []);

  const getCompanyName = (id: number) =>
    companies.find(c => c.id === id)?.name || '—';

  const getSupervisorName = (id: number) =>
    supervisors.find(s => s.id === id)?.lastName || '—';

  const getStudentName = (id: number) => {
    const s = students.find(st => st.id === id);
    return s ? `${s.firstName} ${s.lastName}` : '—';
  };

  return (
    <table className="practice-table">
      <thead>
        <tr>
          <th>Študent</th>
          <th>Firma</th>
          <th>Školiteľ praxe</th>
          <th>Začiatok praxe</th>
          <th>Koniec praxe</th>
          <th>Popis</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {practices.length === 0 ? (
          <tr>
            <td colSpan={7} style={{ textAlign: 'center' }}>
              Žiadne praxe na zobrazenie.
            </td>
          </tr>
        ) : (
          practices.map((p) => (
            <tr key={p.id}>
              <td>{getStudentName(p.studentId)}</td>
              <td>{getCompanyName(p.companyId)}</td>
              <td>{getSupervisorName(p.supervisorId)}</td>
              <td>{new Date(p.startDate).toLocaleDateString('sk-SK')}</td>
              <td>{new Date(p.endDate).toLocaleDateString('sk-SK')}</td>
              <td>{p.description || '—'}</td>
              <td>{p.status || '—'}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
};

export default PracticeTable;
