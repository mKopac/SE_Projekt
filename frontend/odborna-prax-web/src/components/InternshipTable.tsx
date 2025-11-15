import React, { useEffect, useState } from 'react';
import './../css/InternshipTable.css';

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
  internships?: Internship[];
}

const baseUrl = "http://localhost:8080";

const InternshipTable: React.FC<Props> = ({ internships = [] }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const token = localStorage.getItem("token") ?? "";
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    // LOAD COMPANIES
    fetch(`${baseUrl}/dashboard/companies`, { headers })
      .then(res => res.ok ? res.json() : [])
      .then(data => setCompanies(Array.isArray(data) ? data : []))
      .catch(() => setCompanies([]));

    // LOAD MENTORS
    fetch(`${baseUrl}/dashboard/mentors`, { headers })
      .then(res => res.ok ? res.json() : [])
      .then(data => setMentors(Array.isArray(data) ? data : []))
      .catch(() => setMentors([]));

    // LOAD STUDENTS
    fetch(`${baseUrl}/dashboard/students`, { headers })
      .then(res => res.ok ? res.json() : [])
      .then(data => setStudents(Array.isArray(data) ? data : []))
      .catch(() => setStudents([]));
  }, []);

  const getCompanyName = (id: number) =>
    companies.find(c => c.id === id)?.name || "—";

  const getMentorName = (id: number | null) => {
    if (!id) return "—";
    const m = mentors.find(x => x.id === id);
    return m ? `${m.firstName} ${m.lastName}` : "—";
  };

  const getStudentName = (id: number) => {
    const s = students.find(st => st.id === id);
    return s ? `${s.firstName} ${s.lastName}` : "—";
  };

  const toggleExpand = (id: number) =>
    setExpandedId(prev => (prev === id ? null : id));

  return (
    <table className="practice-table">
      <thead>
        <tr>
          <th>Študent</th>
          <th>Firma</th>
          <th>Mentor</th>
          <th>Začiatok</th>
          <th>Koniec</th>
          <th>Ak. rok</th>
          <th>Semester</th>
        </tr>
      </thead>

      <tbody>
        {internships.length === 0 ? (
          <tr>
            <td colSpan={7} style={{ textAlign: "center" }}>
              Žiadne praxe na zobrazenie.
            </td>
          </tr>
        ) : (
          internships.map(p => (
            <React.Fragment key={p.id}>
              <tr className="clickable-row" onClick={() => toggleExpand(p.id)}>
                <td>{getStudentName(p.studentId)}</td>
                <td>{getCompanyName(p.companyId)}</td>
                <td>{getMentorName(p.mentorId)}</td>
                <td>{new Date(p.dateStart).toLocaleDateString("sk-SK")}</td>
                <td>{new Date(p.dateEnd).toLocaleDateString("sk-SK")}</td>
                <td>{p.academicYear}</td>
                <td>{p.semester}</td>
              </tr>

              {expandedId === p.id && (
                <tr className="expanded-row">
                  <td colSpan={7}>
                    <div className="expanded-content">
                      <p><strong>Mentor:</strong> {getMentorName(p.mentorId)}</p>
                      <p><strong>Akademický rok:</strong> {p.academicYear}</p>
                      <p><strong>Semester:</strong> {p.semester}</p>
                      <p><strong>Začiatok:</strong> {p.dateStart}</p>
                      <p><strong>Koniec:</strong> {p.dateEnd}</p>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))
        )}
      </tbody>
    </table>
  );
};

export default InternshipTable;
