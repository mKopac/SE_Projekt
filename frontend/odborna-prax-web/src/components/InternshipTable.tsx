import React, { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import "./../css/InternshipTable.css";

interface Company {
  id: number;
  name: string;
}
interface Mentor {
  id: number;
  firstName: string;
  lastName: string;
}
interface Student {
  id: number;
  firstName: string;
  lastName: string;
}

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
  description: string;
}

interface Props {
  internships: Internship[];
  role: string;
}

const baseUrl = "http://localhost:8080";

const InternshipTable: React.FC<Props> = ({
  internships: initialInternships,
  role,
}) => {
  const { t } = useTranslation("dashboard");

  const [companies, setCompanies] = useState<Company[]>([]);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  const [internships, setInternships] =
    useState<Internship[]>(initialInternships);

  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [localData, setLocalData] =
    useState<Internship[]>(initialInternships);

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
      .then((res) => res.json())
      .then(setCompanies)
      .catch(() => setCompanies([]));

    fetch(`${baseUrl}/dashboard/mentors`, { headers })
      .then((res) => res.json())
      .then(setMentors)
      .catch(() => setMentors([]));

    fetch(`${baseUrl}/dashboard/students`, { headers })
      .then((res) => res.json())
      .then(setStudents)
      .catch(() => setStudents([]));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();

    if (search) params.append("search", search);
    if (filterCompany !== "ALL")
      params.append("companyId", String(filterCompany));
    if (filterMentor !== "ALL") params.append("mentorId", String(filterMentor));
    if (filterYear !== "ALL") params.append("academicYear", filterYear);
    if (filterSemester !== "ALL")
      params.append("semester", String(filterSemester));

    fetch(`${baseUrl}/dashboard/internships?${params.toString()}`, { headers })
      .then((res) => res.json())
      .then((data) => {
        const mapped = data.map((d: any) => d.internship);
        setInternships(mapped);
      })
      .catch(() => setInternships([]));
    setLocalData(internships);
  }, [search, filterCompany, filterMentor, filterYear, filterSemester, internships]);

  const getCompanyName = (id: number) =>
    companies.find((c) => c.id === id)?.name || "—";

  const getMentorName = (id: number | null) => {
    if (!id) return "—";
    const m = mentors.find((x) => x.id === id);
    return m ? `${m.firstName} ${m.lastName}` : "—";
  };

  const getStudentName = (id: number) => {
    const s = students.find((st) => st.id === id);
    return s ? `${s.firstName} ${s.lastName}` : "—";
  };

  const toggleExpand = (id: number) => {
    setExpandedId((prev) => {
      const newValue = prev === id ? null : id;

      // ak rozklikávame (otvárame), načítaj dokumenty
      if (newValue !== null) {
        loadDocuments(newValue);
      }

      return newValue;
    });
  };

  const handleCompanyDecision = async (
    id: number,
    decision: "ACCEPT" | "REJECT"
  ) => {
    try {
      const res = await fetch(
        `${baseUrl}/dashboard/internship/${id}/company-decision?decision=${decision}`,
        { method: "POST", headers }
      );

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        alert(data?.error ?? t("internshipTable.companyActions.stateError"));
        return;
      }

      const newState: string =
        data?.newState ?? (decision === "ACCEPT" ? "ACCEPTED" : "REJECTED");

      setLocalData((prev) =>
        prev.map((i) => (i.id === id ? { ...i, status: newState } : i))
      );

      alert(t("internshipTable.companyActions.stateChanged"));
    } catch {
      alert(t("internshipTable.companyActions.serverError"));
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
        alert(data?.error ?? t("internshipTable.companyActions.stateError"));
        return;
      }

      const newState: string = data?.newState ?? adminState;

      setLocalData((prev) =>
        prev.map((i) => (i.id === id ? { ...i, status: newState } : i))
      );

      alert(t("internshipTable.companyActions.stateChanged"));
    } catch {
      alert(t("internshipTable.companyActions.serverError"));
    }
  };

  const filteredData = useMemo(() => {
    return localData.filter((i) => {
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

      const companyMatch =
        filterCompany === "ALL" || i.companyId === filterCompany;
      const mentorMatch =
        filterMentor === "ALL" || i.mentorId === filterMentor;
      const yearMatch = filterYear === "ALL" || i.academicYear === filterYear;
      const semesterMatch =
        filterSemester === "ALL" || i.semester === filterSemester;

      return (
        searchMatch && companyMatch && mentorMatch && yearMatch && semesterMatch
      );
    });
  }, [localData, search, filterCompany, filterMentor, filterYear, filterSemester]);

  const loadDocuments = async (internshipId: number) => {
    try {
      const res = await fetch(
        `${baseUrl}/dashboard/internships/${internshipId}/documents`,
        { headers }
      );
      if (res.ok) {
        const data = await res.json();
        setDocuments((prev) => ({ ...prev, [internshipId]: data }));
      } else {
        setDocuments((prev) => ({ ...prev, [internshipId]: [] }));
      }
    } catch {
      setDocuments((prev) => ({ ...prev, [internshipId]: [] }));
    }
  };

  const handleUpload = async (
    internshipId: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const form = new FormData();
    form.append("file", file);

    const res = await fetch(
      `${baseUrl}/documents/upload/timestatement?internshipId=${internshipId}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      }
    );

    if (res.ok) {
      alert(t("internshipTable.documents.uploaded"));
      loadDocuments(internshipId);
    } else {
      alert(t("internshipTable.documents.uploadError"));
    }
  };

  const handleUploadContract = async (
    internshipId: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const form = new FormData();
    form.append("file", file);

    const res = await fetch(
      `${baseUrl}/documents/upload/contract?internshipId=${internshipId}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      }
    );

    if (res.ok) {
      alert(t("internshipTable.documents.contractUploaded"));
      loadDocuments(internshipId);
    } else {
      alert(t("internshipTable.documents.contractUploadError"));
    }
  };

  const renderDocuments = (internshipId: number) => {
    const docs = documents[internshipId] || [];

    // rozdelenie dokumentov podľa typu
    const contract = docs.find((d) => d.documentType === "CONTRACT");
    const timestatement = docs.find((d) => d.documentType === "TIMESTATEMENT");

    return (
      <div style={{ marginTop: 10 }}>
        {/* === CONTRACT (ZMLUVA) === */}
        <div style={{ marginBottom: 15 }}>
          <strong>{t("internshipTable.documents.contract")}:</strong>
          <br />

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
              <span style={{ color: "#666" }}>
                {t("internshipTable.documents.contractMissing")}
              </span>
              <br />
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
          <strong>{t("internshipTable.documents.timestatement")}:</strong>
          <br />

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

              <span
                className={`state-badge ${timestatement.currentState?.toLowerCase()}`}
              >
                {timestatement.currentState === "APPROVED" &&
                  t("internshipTable.documents.approved")}
                {timestatement.currentState === "DENIED" &&
                  t("internshipTable.documents.denied")}
                {timestatement.currentState === "UPLOADED" &&
                  t("internshipTable.documents.waiting")}
                {["UNKNOWN", null].includes(timestatement.currentState) &&
                  t("internshipTable.documents.noState")}
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
          placeholder={t("internshipTable.search.placeholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={filterCompany}
          onChange={(e) =>
            setFilterCompany(
              e.target.value === "ALL" ? "ALL" : Number(e.target.value)
            )
          }
        >
          <option value="ALL">{t("internshipTable.filters.allCompanies")}</option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={filterMentor}
          onChange={(e) =>
            setFilterMentor(
              e.target.value === "ALL" ? "ALL" : Number(e.target.value)
            )
          }
        >
          <option value="ALL">{t("internshipTable.filters.allMentors")}</option>
          {mentors.map((m) => (
            <option key={m.id} value={m.id}>
              {m.firstName} {m.lastName}
            </option>
          ))}
        </select>

        <select
          value={filterYear}
          onChange={(e) => setFilterYear(e.target.value as string | "ALL")}
        >
          <option value="ALL">{t("internshipTable.filters.allYears")}</option>
          {Array.from(new Set(localData.map((i) => i.academicYear))).map(
            (year) => (
              <option key={year} value={year}>
                {year}
              </option>
            )
          )}
        </select>

        <select
          value={filterSemester}
          onChange={(e) =>
            setFilterSemester(
              e.target.value === "ALL" ? "ALL" : Number(e.target.value)
            )
          }
        >
          <option value="ALL">{t("internshipTable.filters.allSemesters")}</option>
          {Array.from(new Set(localData.map((i) => i.semester))).map((sem) => (
            <option key={sem} value={sem}>
              {sem}
            </option>
          ))}
        </select>

        <button
          className="export-btn"
          onClick={async () => {
            const params = new URLSearchParams();

            if (search) params.append("search", search);
            if (filterCompany !== "ALL")
              params.append("companyId", String(filterCompany));
            if (filterMentor !== "ALL")
              params.append("mentorId", String(filterMentor));
            if (filterYear !== "ALL") params.append("academicYear", filterYear);
            if (filterSemester !== "ALL")
              params.append("semester", String(filterSemester));

            const url = `${baseUrl}/dashboard/internships/export?${params.toString()}`;

            const response = await fetch(url, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            if (!response.ok) {
              alert(t("internshipTable.export.failed"));
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
          {t("internshipTable.export.csv")}
        </button>
      </div>

      {/* TABLE */}
      <table className="practice-table">
        <thead>
          <tr>
            <th>{t("internshipTable.table.student")}</th>
            <th>{t("internshipTable.table.company")}</th>
            <th>{t("internshipTable.table.mentor")}</th>
            <th>{t("internshipTable.table.start")}</th>
            <th>{t("internshipTable.table.end")}</th>
            <th>{t("internshipTable.table.year")}</th>
            <th>{t("internshipTable.table.semester")}</th>
            <th>{t("internshipTable.table.status")}</th>
          </tr>
        </thead>

        <tbody>
          {filteredData.length === 0 ? (
            <tr>
              <td colSpan={8} style={{ textAlign: "center" }}>
                {t("internshipTable.table.noResults")}
              </td>
            </tr>
          ) : (
            filteredData.map((p) => (
              <React.Fragment key={p.id}>
                <tr
                  className="clickable-row"
                  onClick={() => toggleExpand(p.id)}
                >
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
                        <p>
                          <strong>{t("internshipTable.detail.student")}:</strong>{" "}
                          {getStudentName(p.studentId)}
                        </p>
                        <p>
                          <strong>{t("internshipTable.detail.company")}:</strong>{" "}
                          {getCompanyName(p.companyId)}
                        </p>
                        <p>
                          <strong>{t("internshipTable.detail.mentor")}:</strong>{" "}
                          {getMentorName(p.mentorId)}
                        </p>
                        <p>
                          <strong>{t("internshipTable.detail.year")}:</strong>{" "}
                          {p.academicYear}
                        </p>
                        <p>
                          <strong>{t("internshipTable.detail.semester")}:</strong>{" "}
                          {p.semester}
                        </p>
                        <p>
                          <strong>{t("internshipTable.detail.start")}:</strong>{" "}
                          {p.dateStart}
                        </p>
                        <p>
                          <strong>{t("internshipTable.detail.end")}:</strong>{" "}
                          {p.dateEnd}
                        </p>

                        <p>
                          <strong>{t("internshipTable.detail.description")}:</strong>{" "}
                          {p.description || t("internshipTable.detail.noDescription")}
                        </p>

                        <p>
                          <strong>{t("internshipTable.detail.status")}:</strong>{" "}
                          {p.status}
                        </p>

                        {role === "STUDENT" && (
                          <div style={{ marginTop: 20 }}>
                            {(() => {
                              const docs = documents[p.id] || [];
                              const contract = docs.find(
                                (d) => d.documentType === "CONTRACT"
                              );
                              const timestatement = docs.find(
                                (d) => d.documentType === "TIMESTATEMENT"
                              );

                              return (
                                <>
                                  {/* ====== CONTRACT – Zmluva o praxi ====== */}
                                  <div style={{ marginBottom: 16 }}>
                                    <strong>
                                      {t("internshipTable.documents.contract")}:
                                    </strong>
                                    <br />
                                    {contract ? (
                                      <div
                                        className="document-item"
                                        style={{ marginTop: 8 }}
                                      >
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
                                        <span style={{ color: "#666" }}>
                                          {t(
                                            "internshipTable.documents.contractMissing"
                                          )}
                                        </span>
                                        <br />
                                        <input
                                          type="file"
                                          accept=".pdf,.doc,.docx"
                                          onChange={(e) =>
                                            handleUploadContract(p.id, e)
                                          }
                                          style={{ marginTop: 6 }}
                                        />
                                      </>
                                    )}
                                  </div>

                                  {/* ====== TIMESTATEMENT – Výkaz o činnosti ====== */}
                                  <div>
                                    <strong>
                                      {t(
                                        "internshipTable.documents.timestatement"
                                      )}
                                      :
                                    </strong>
                                    <br />
                                    {timestatement ? (
                                      <div
                                        className="document-item"
                                        style={{ marginTop: 8 }}
                                      >
                                        <a
                                          href={`${baseUrl}/documents/${timestatement.documentId}/download`}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="doc-link"
                                        >
                                          {timestatement.fileName}
                                        </a>

                                        <span
                                          className={`state-badge ${timestatement.currentState?.toLowerCase()}`}
                                        >
                                          {timestatement.currentState ===
                                            "APPROVED" &&
                                            t(
                                              "internshipTable.documents.approved"
                                            )}
                                          {timestatement.currentState ===
                                            "DENIED" &&
                                            t(
                                              "internshipTable.documents.denied"
                                            )}
                                          {timestatement.currentState ===
                                            "UPLOADED" &&
                                            t(
                                              "internshipTable.documents.waiting"
                                            )}
                                          {["UNKNOWN", null].includes(
                                            timestatement.currentState
                                          ) &&
                                            t("internshipTable.documents.noState")}
                                        </span>
                                      </div>
                                    ) : (
                                      <>
                                        <input
                                          type="file"
                                          accept="application/pdf"
                                          onChange={(e) => handleUpload(p.id, e)}
                                          style={{ marginTop: 6 }}
                                        />
                                      </>
                                    )}
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
                              onClick={() =>
                                handleCompanyDecision(p.id, "ACCEPT")
                              }
                            >
                              {t("internshipTable.companyActions.accept")}
                            </button>
                            <button
                              className="btn-reject"
                              onClick={() =>
                                handleCompanyDecision(p.id, "REJECT")
                              }
                            >
                              {t("internshipTable.companyActions.reject")}
                            </button>
                          </div>
                        )}

                        {role === "ADMIN" &&
                          ["ACCEPTED", "APPROVED", "PASSED", "FAILED"].includes(
                            p.status.toUpperCase()
                          ) && (
                            <div style={{ marginTop: 15 }}>
                              <select
                                value={adminState}
                                onChange={(e) => setAdminState(e.target.value)}
                              >
                                <option value="APPROVED">
                                  {t("internshipTable.admin.approved")}
                                </option>
                                <option value="DENIED">
                                  {t("internshipTable.admin.denied")}
                                </option>
                                <option value="PASSED">
                                  {t("internshipTable.admin.passed")}
                                </option>
                                <option value="FAILED">
                                  {t("internshipTable.admin.failed")}
                                </option>
                              </select>
                              <button
                                className="btn-ok"
                                onClick={() => handleAdminStateChange(p.id)}
                              >
                                {t("internshipTable.admin.ok")}
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
