import React, { useEffect, useState, useMemo } from 'react';
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

  // SEARCH + FILTERS
  const [search, setSearch] = useState("");
  const [filterCompany, setFilterCompany] = useState<number | "ALL">("ALL");
  const [filterMentor, setFilterMentor] = useState<number | "ALL">("ALL");
  const [filterYear, setFilterYear] = useState<string | "ALL">("ALL");
  const [filterSemester, setFilterSemester] = useState<number | "ALL">("ALL");

  const token = localStorage.getItem("token") ?? "";
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetch(`${baseUrl}/dashboard/companies`, { headers })
      .then(res => res.ok ? res.json() : [])
      .then(data => setCompanies(Array.isArray(data) ? data : []))
      .catch(() => setCompanies([]));

    fetch(`${baseUrl}/dashboard/mentors`, { headers })
      .then(res => res.ok ? res.json() : [])
      .then(data => setMentors(Array.isArray(data) ? data : []))
      .catch(() => setMentors([]));

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

  // 🔍 FILTERING + SEARCH LOGIC
  const filteredData = useMemo(() => {
    return internships.filter(i => {
      const student = getStudentName(i.studentId).toLowerCase();
      const company = getCompanyName(i.companyId).toLowerCase();
      const mentor = getMentorName(i.mentorId).toLowerCase();

      const searchMatch =
        student.includes(search.toLowerCase()) ||
        company.includes(search.toLowerCase()) ||
        mentor.includes(search.toLowerCase()) ||
        i.academicYear.toLowerCase().includes(search.toLowerCase()) ||
        i.semester.toString().includes(search) ||
        i.dateStart.includes(search) ||
        i.dateEnd.includes(search);

      const companyMatch = filterCompany === "ALL" || i.companyId === filterCompany;
      const mentorMatch = filterMentor === "ALL" || i.mentorId === filterMentor;
      const yearMatch = filterYear === "ALL" || i.academicYear === filterYear;
      const semesterMatch = filterSemester === "ALL" || i.semester === filterSemester;

      return searchMatch && companyMatch && mentorMatch && yearMatch && semesterMatch;
    });
  }, [internships, search, filterCompany, filterMentor, filterYear, filterSemester]);

  return (
    <>
      {/* SEARCH BAR + FILTERS */}
      <div className="filter-container">
        <input
          type="text"
          className="search-input"
          placeholder="Hľadať..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <select value={filterCompany} onChange={e => setFilterCompany(e.target.value === "ALL" ? "ALL" : Number(e.target.value))}>
          <option value="ALL">Všetky firmy</option>
          {companies.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select value={filterMentor} onChange={e => setFilterMentor(e.target.value === "ALL" ? "ALL" : Number(e.target.value))}>
          <option value="ALL">Všetci mentori</option>
          {mentors.map(m => (
            <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
          ))}
        </select>

        <select value={filterYear} onChange={e => setFilterYear(e.target.value)}>
          <option value="ALL">Všetky roky</option>
          {Array.from(new Set(internships.map(i => i.academicYear))).map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>

        <select 
          value={filterSemester} 
          onChange={e => setFilterSemester(e.target.value === "ALL" ? "ALL" : Number(e.target.value))}>
          <option value="ALL">Všetky semestre</option>
          {Array.from(new Set(internships.map(i => i.semester))).map(sem => (
            <option key={sem} value={sem}>{sem}</option>
          ))}
        </select>
      </div>



      {/* 📄 TABLE */}
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
          {filteredData.length === 0 ? (
            <tr>
              <td colSpan={7} style={{ textAlign: "center" }}>
                Žiadne výsledky.
              </td>
            </tr>
          ) : (
            filteredData.map(p => (
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
    </>
  );
};

export default InternshipTable;
