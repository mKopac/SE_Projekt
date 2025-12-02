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
  status: string;

  /** ➕ PRIDANÉ PRE POPIS */
  description: string;
}

interface Props {
  internships: Internship[];
  role: string;
}

const baseUrl = "http://localhost:8080";

const InternshipTable: React.FC<Props> = ({ internships: initialInternships, role }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  const [internships, setInternships] = useState<Internship[]>(initialInternships);

  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [localData, setLocalData] = useState<Internship[]>(initialInternships);

const [documents, setDocuments] = useState<Record<number, any[]>>({});


  // filtre
  const [search, setSearch] = useState("");
  const [filterCompany, setFilterCompany] = useState<number | "ALL">("ALL");
  const [filterMentor, setFilterMentor] = useState<number | "ALL">("ALL");
  const [filterYear, setFilterYear] = useState<string | "ALL">("ALL");
  const [filterSemester, setFilterSemester] = useState<number | "ALL">("ALL");

  // admin dropdown state
  const [adminState, setAdminState] = useState<string>("APPROVED");

  const token = localStorage.getItem("token") ?? "";
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetch(`${baseUrl}/dashboard/companies`, { headers })
      .then(res => res.json())
      .then(setCompanies)
      .catch(() => setCompanies([]));

    fetch(`${baseUrl}/dashboard/mentors`, { headers })
      .then(res => res.json())
      .then(setMentors)
      .catch(() => setMentors([]));

    fetch(`${baseUrl}/dashboard/students`, { headers })
      .then(res => res.json())
      .then(setStudents)
      .catch(() => setStudents([]));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();

    if (search) params.append("search", search);
    if (filterCompany !== "ALL") params.append("companyId", String(filterCompany));
    if (filterMentor !== "ALL") params.append("mentorId", String(filterMentor));
    if (filterYear !== "ALL") params.append("academicYear", filterYear);
    if (filterSemester !== "ALL") params.append("semester", String(filterSemester));

    fetch(`${baseUrl}/dashboard/internships?${params.toString()}`, { headers })
      .then(res => res.json())
      .then(data => {
        const mapped = data.map((d: any) => d.internship);
        setInternships(mapped);
      })
      .catch(() => setInternships([]));
    setLocalData(internships);

  }, [search, filterCompany, filterMentor, filterYear, filterSemester, internships]);

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

const toggleExpand = (id: number) => {
  setExpandedId(prev => {
    const newValue = prev === id ? null : id;

    // ak rozklikávame (otvárame), načítaj dokumenty
    if (newValue !== null) {
      loadDocuments(newValue);
    }

    return newValue;
  });
};



  const handleCompanyDecision = async (id: number, decision: "ACCEPT" | "REJECT") => {
    try {
      const res = await fetch(
        `${baseUrl}/dashboard/internship/${id}/company-decision?decision=${decision}`,
        { method: "POST", headers }
      );

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        alert(data?.error ?? "Chyba pri zmene stavu praxe.");
        return;
      }

      const newState: string =
        data?.newState ?? (decision === "ACCEPT" ? "ACCEPTED" : "REJECTED");

      setLocalData(prev =>
        prev.map(i => (i.id === id ? { ...i, status: newState } : i))
      );

      alert("Stav praxe bol úspešne zmenený.");
    } catch {
      alert("Chyba pri komunikácii so serverom.");
    }
  };

  const handleAdminStateChange = async (id: number) => {
    try {
      const res = await fetch(
        `${baseUrl}/dashboard/internship/${id}/admin-state?state=${adminState}`,
        { method: "POST", headers }
      );

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        alert(data?.error ?? "Chyba pri zmene stavu praxe.");
        return;
      }

      const newState: string = data?.newState ?? adminState;

      setLocalData(prev =>
        prev.map(i => (i.id === id ? { ...i, status: newState } : i))
      );

      alert("Stav praxe bol úspešne zmenený.");
    } catch {
      alert("Chyba pri komunikácii so serverom.");
    }
  };

  const filteredData = useMemo(() => {
    return localData.filter(i => {
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
  }, [localData, search, filterCompany, filterMentor, filterYear, filterSemester]);

const loadDocuments = async (internshipId: number) => {
  try {
    const res = await fetch(`${baseUrl}/dashboard/internships/${internshipId}/documents`, { headers });
    if (res.ok) {
      const data = await res.json();
      setDocuments(prev => ({ ...prev, [internshipId]: data }));
    } else {
      setDocuments(prev => ({ ...prev, [internshipId]: [] }));
    }
  } catch {
    setDocuments(prev => ({ ...prev, [internshipId]: [] }));
  }
};



const handleUpload = async (internshipId: number, e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const form = new FormData();
  form.append("file", file);

  const res = await fetch(
    `${baseUrl}/documents/upload/timestatement?internshipId=${internshipId}`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form
    }
  );

  if (res.ok) {
    alert("Výkaz bol nahraný.");
    loadDocuments(internshipId);
  } else {
    alert("Chyba pri nahrávaní.");
  }
};

const handleUploadContract = async (internshipId: number, e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const form = new FormData();
  form.append("file", file);

  const res = await fetch(
    `${baseUrl}/documents/upload/contract?internshipId=${internshipId}`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form
    }
  );

  if (res.ok) {
    alert("Zmluva bola nahraná.");
    loadDocuments(internshipId);
  } else {
    alert("Chyba pri nahrávaní zmluvy.");
  }
};

const renderDocuments = (internshipId: number) => {
  const docs = documents[internshipId] || [];

  // rozdelenie dokumentov podľa typu
  const contract = docs.find(d => d.documentType === "CONTRACT");
  const timestatement = docs.find(d => d.documentType === "TIMESTATEMENT");

  return (
    <div style={{ marginTop: 10 }}>

      {/* === CONTRACT (ZMLUVA) === */}
      <div style={{ marginBottom: 15 }}>
        <strong>Zmluva o praxi:</strong><br/>

        {/* Ak existuje zmluva */}
        {contract ? (
          <div className="document-item" style={{ marginTop: 8 }}>
            <a
              href={`${baseUrl}/documents/${contract.documentId}/download`}
              target="_blank"
              rel="noreferrer"
              className="doc-link"
            >
              {contract.fileName}
            </a>
          </div>
        ) : (
          <>
            <span style={{ color: "#666" }}>Zmluva zatiaľ nebola nahraná.</span><br/>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => handleUploadContract(internshipId, e)}
              style={{ marginTop: 6 }}
            />
          </>
        )}
      </div>


      {/* === TIMESTATEMENT (VÝKAZ ČINNOSTI) === */}
      <div>
        <strong>Výkaz o činnosti:</strong><br/>

        {timestatement ? (
          <div className="document-item" style={{ marginTop: 8 }}>
            <a
              href={`${baseUrl}/documents/${timestatement.documentId}/download`}
              target="_blank"
              rel="noreferrer"
              className="doc-link"
            >
              {timestatement.fileName}
            </a>

            <span className={`state-badge ${timestatement.currentState?.toLowerCase()}`}>
              {timestatement.currentState === "APPROVED" && "✔️ Potvrdené"}
              {timestatement.currentState === "DENIED" && "❌ Zamietnuté"}
              {timestatement.currentState === "UPLOADED" && "⏳ Čaká na schválenie"}
              {["UNKNOWN", null].includes(timestatement.currentState) && "🟦 Bez stavu"}
            </span>
          </div>
        ) : (
          <>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => handleUpload(internshipId, e)}
              style={{ marginTop: 6 }}
            />
          </>
        )}
      </div>

    </div>
  );
};







  return (
    <>
      {/* FILTERY + SEARCH */}
      <div className="filter-container">
        <input
          type="text"
          className="search-input"
          placeholder="Hľadať..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <select
          value={filterCompany}
          onChange={e =>
            setFilterCompany(e.target.value === "ALL" ? "ALL" : Number(e.target.value))
          }
        >
          <option value="ALL">Všetky firmy</option>
          {companies.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select
          value={filterMentor}
          onChange={e =>
            setFilterMentor(e.target.value === "ALL" ? "ALL" : Number(e.target.value))
          }
        >
          <option value="ALL">Všetci mentori</option>
          {mentors.map(m => (
            <option key={m.id} value={m.id}>
              {m.firstName} {m.lastName}
            </option>
          ))}
        </select>

        <select
          value={filterYear}
          onChange={e => setFilterYear(e.target.value as string | "ALL")}
        >
          <option value="ALL">Všetky roky</option>
          {Array.from(new Set(localData.map(i => i.academicYear))).map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>

        <select
          value={filterSemester}
          onChange={e => setFilterSemester(e.target.value === "ALL" ? "ALL" : Number(e.target.value))}
        >
          <option value="ALL">Všetky semestre</option>
          {Array.from(new Set(localData.map(i => i.semester))).map(sem => (
            <option key={sem} value={sem}>{sem}</option>
          ))}
        </select>

        <button
          className="export-btn"
          onClick={async () => {
            const params = new URLSearchParams();

            if (search) params.append("search", search);
            if (filterCompany !== "ALL") params.append("companyId", String(filterCompany));
            if (filterMentor !== "ALL") params.append("mentorId", String(filterMentor));
            if (filterYear !== "ALL") params.append("academicYear", filterYear);
            if (filterSemester !== "ALL") params.append("semester", String(filterSemester));

            const url = `${baseUrl}/dashboard/internships/export?${params.toString()}`;

            const response = await fetch(url, {
              headers: {
                Authorization: `Bearer ${token}`
              }
            });

            if (!response.ok) {
              alert("Export sa nepodaril – nemáš oprávnenie alebo token expiroval.");
              return;
            }

            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = downloadUrl;
            a.download = "internships_export.csv";
            document.body.appendChild(a);
            a.click();
            a.remove();
        }}
        >
          Export CSV
        </button>

      </div>

      {/* TABLE */}
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
            <th>Stav</th>
          </tr>
        </thead>

        <tbody>
          {filteredData.length === 0 ? (
            <tr>
              <td colSpan={8} style={{ textAlign: "center" }}>
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
                  <td>{p.status}</td>
                </tr>

                {expandedId === p.id && (
                  <tr className="expanded-row">
                    <td colSpan={8}>
                      <div className="expanded-content">
                        <p><strong>Študent:</strong> {getStudentName(p.studentId)}</p>
                        <p><strong>Firma:</strong> {getCompanyName(p.companyId)}</p>
                        <p><strong>Mentor:</strong> {getMentorName(p.mentorId)}</p>
                        <p><strong>Akademický rok:</strong> {p.academicYear}</p>
                        <p><strong>Semester:</strong> {p.semester}</p>
                        <p><strong>Dátum začiatku:</strong> {p.dateStart}</p>
                        <p><strong>Dátum konca:</strong> {p.dateEnd}</p>

                        {/* ➕ PRIDANÉ – POPIS PRAXE */}
                        <p><strong>Popis praxe:</strong> {p.description || "—"}</p>

                        <p><strong>Stav praxe:</strong> {p.status}</p>
                        {role === "STUDENT" && (
  <div style={{ marginTop: 20 }}>
    {(() => {
      const docs = documents[p.id] || [];

      if (docs.length === 0) {
        return (
          <>
            <strong>Nahrať výkaz o činnosti:</strong>
            <br />
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => handleUpload(p.id, e)}
            />
          </>
        );
      }

      const doc = docs[0];
      return (
        <>
          <strong>Nahraný výkaz o činnosti:</strong>
          <div className="document-item" style={{ marginTop: 8 }}>
            <a
              href={`${baseUrl}/documents/${doc.documentId}/download`}
              target="_blank"
              rel="noreferrer"
              className="doc-link"
            >
              {doc.fileName}
            </a>

            <span className={`state-badge ${doc.currentState.toLowerCase()}`}>
              {doc.currentState === "APPROVED" && " Potvrdené"}
              {doc.currentState === "DENIED" && " Zamietnuté"}
              {doc.currentState === "UPLOADED" && "Čaká na schválenie"}
              {["UNKNOWN", null].includes(doc.currentState) && "🟦 Bez stavu"}
            </span>
          </div>
        </>
      );
    })()}
  </div>
)}



                        {role === "COMPANY" && p.status === "CREATED" && (
                          <div style={{ marginTop: 15 }}>
                            <button
                              className="btn-accept"
                              onClick={() => handleCompanyDecision(p.id, "ACCEPT")}
                            >
                              Potvrdiť prax
                            </button>
                            <button
                              className="btn-reject"
                              onClick={() => handleCompanyDecision(p.id, "REJECT")}
                            >
                              Zamietnuť prax
                            </button>
                          </div>
                        )}

                        {role === "ADMIN" &&
                          ["ACCEPTED", "APPROVED", "PASSED", "FAILED"]
                            .includes(p.status.toUpperCase()) && (
                          <div style={{ marginTop: 15 }}>
                            <select
                              value={adminState}
                              onChange={e => setAdminState(e.target.value)}
                            >
                              <option value="APPROVED">Schválená</option>
                              <option value="DENIED">Zamietnutá</option>
                              <option value="PASSED">Úspešne absolvovaná</option>
                              <option value="FAILED">Neúspešne absolvovaná</option>
                            </select>
                            <button
                              className="btn-ok"
                              onClick={() => handleAdminStateChange(p.id)}
                            >
                              OK
                            </button>
                          </div>
                        )}
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
