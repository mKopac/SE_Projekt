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

type InternshipStatus =
  | "CREATED"
  | "ACCEPTED"
  | "REJECTED"
  | "APPROVED"
  | "DENIED"
  | "PASSED"
  | "FAILED"
  | "UNKNOWN";

  const normalizeInternshipStatus = (status: string | null | undefined): InternshipStatus => {
  const s = (status ?? "").toString().trim().toUpperCase();

  const allowed: InternshipStatus[] = [
    "CREATED",
    "ACCEPTED",
    "REJECTED",
    "APPROVED",
    "DENIED",
    "PASSED",
    "FAILED",
  ];

  return (allowed as string[]).includes(s) ? (s as InternshipStatus) : "UNKNOWN";
};

interface Props {
  internships: Internship[];
  role: string;
}

const baseUrl = "https://localhost:8443";

const InternshipTable: React.FC<Props> = ({
  internships: initialInternships,
  role,
}) => {
  const { t } = useTranslation("dashboard");

  const translateStatus = (status: string | null | undefined) => {
    const key = normalizeInternshipStatus(status);
    return t(`status.${key}`);
  };

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
        setLocalData(mapped);
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

  const loadDocuments = async (internshipId: number) => {
    try {
      const res = await fetch(
        `${baseUrl}/dashboard/internships/${internshipId}/documents`,
        { headers }
      );
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

  const toggleExpand = (id: number) => {
    setExpandedId(prev => {
      const newValue = prev === id ? null : id;

      if (newValue !== null) {
        loadDocuments(newValue);
      }

      return newValue;
    });
  };

  const handleDownloadDocument = async (documentId: number, fileName: string) => {
    try {
      const res = await fetch(`${baseUrl}/documents/${documentId}/download`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        alert(t("internshipTable.documents.downloadError"));
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert(t("internshipTable.documents.serverError"));
    }
  };

  const handleCompanyDecision = async (
    id: number,
    decision: "ACCEPT" | "REJECT" | "APPROVED" | "DENIED"
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

      const newState: string = data?.newState ?? decision;

      setLocalData((prev) =>
        prev.map((i) => (i.id === id ? { ...i, status: newState } : i))
      );

      alert(t("internshipTable.companyActions.stateChanged"));
    } catch {
      alert(t("internshipTable.companyActions.serverError"));
    }
  };

  const handleAdminStateChange = async (id: number, targetState: string) => {
  try {
    const res = await fetch(
      `${baseUrl}/dashboard/internship/${id}/admin-state?state=${targetState}`,
      { method: "POST", headers }
    );

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      alert(data?.error ?? t("internshipTable.companyActions.stateError"));
      return;
    }

    const newState: string = data?.newState ?? targetState;

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
      alert(t("internshipTable.contract.uploaded"));
      loadDocuments(internshipId);
    } else {
      alert(t("internshipTable.contract.uploadError"));
    }
  };

  const handleDocumentDecision = async (
    documentId: number,
    internshipId: number,
    decision: "APPROVED" | "DENIED"
  ) => {
    try {
      const res = await fetch(
        `${baseUrl}/documents/${documentId}/company-decision?state=${decision}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        alert(data?.error ?? t("internshipTable.documents.stateChangeError"));
        return;
      }

      const newState: string = data?.newState ?? decision;

      setDocuments(prev => {
        const docsForInternship = prev[internshipId] || [];
        const updatedDocs = docsForInternship.map((d: any) =>
          d.documentId === documentId ? { ...d, currentState: newState } : d
        );
        return {
          ...prev,
          [internshipId]: updatedDocs,
        };
      });

      alert(t("documents.stateChanged"));
    } catch (e) {
      console.error(e);
      alert(t("documents.serverError"));
    }
  };

  const renderDocuments = (internship: Internship) => {
    const internshipId = internship.id;
    const docs = documents[internshipId] || [];

    const isStudent = role === "STUDENT";
    const isCompany = role === "COMPANY";

    const contract = docs.find((d: any) => d.documentType === "CONTRACT");
    const timestatement = docs.find((d: any) => d.documentType === "TIMESTATEMENT");


    const getContractStatus = () => {
      if (!contract) return t("contract.status.missing");

      if (internship.status === "CREATED") return t("contract.status.waitingCompany");
      if (internship.status === "ACCEPTED") return t("contract.status.approved");
      if (internship.status === "REJECTED") return t("contract.status.denied");

      return t("contract.status.approved");
    };

    const getTimestatementStatus = () => {
      if (!timestatement) return t("timestatement.status.missing");

      if (timestatement.currentState === "UPLOADED") return t("timestatement.status.waitingCompany");
      if (timestatement.currentState === "APPROVED") return t("timestatement.status.approved");
      if (timestatement.currentState === "DENIED") return t("timestatement.status.denied");

      return t("timestatement.status.unknown");
    };

    return (
      <div style={{ marginTop: 10 }}>


        <div style={{ marginBottom: 15 }}>
          <strong>{t("contract.title")}:</strong><br />

          {contract ? (
            <div className="document-item" style={{ marginTop: 8 }}>
              <button
                type="button"
                className="doc-link"
                onClick={() => handleDownloadDocument(contract.documentId, contract.fileName)}
              >
                {contract.fileName}
              </button>

              <span className="state-badge">{getContractStatus()}</span>
              {isCompany && internship.status === "CREATED" && (
                <div style={{ marginTop: 10 }}>
                  <button
                    className="btn-accept"
                    type="button"
                    onClick={() => handleCompanyDecision(internshipId, "ACCEPT")}
                  >
                    {t("internshipTable.companyActions.accept")}
                  </button>

                  <button
                    className="btn-reject"
                    type="button"
                    onClick={() => handleCompanyDecision(internshipId, "REJECT")}
                    style={{ marginLeft: 8 }}
                  >
                    {t("internshipTable.companyActions.reject")}
                  </button>
                </div>
              )}

            </div>
            
          ) : (
            <>
              {isStudent ? (
                <>
                  <span style={{ color: "#666" }}>{t("contract.missing")}</span><br />
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleUploadContract(internshipId, e)}
                    style={{ marginTop: 6 }}
                  />
                </>
              ) : (
                <span style={{ color: "#666" }}>{t("contract.missing")}</span>
              )}
            </>
          )}
        </div>


        <div>
          <strong>{t("timestatement.title")}:</strong><br />

          {timestatement ? (
            <div className="document-item" style={{ marginTop: 8 }}>
              <button
                type="button"
                className="doc-link"
                onClick={() => handleDownloadDocument(timestatement.documentId, timestatement.fileName)}
              >
                {timestatement.fileName}
              </button>

              <span className="state-badge">{getTimestatementStatus()}</span>

              {isCompany &&
                internship.status === "ACCEPTED" &&
                timestatement.currentState === "UPLOADED" && (
                  <div style={{ marginTop: 8 }}>
                    <button
                      className="btn-accept"
                      onClick={() =>
                        handleDocumentDecision(
                          timestatement.documentId,
                          internshipId,
                          "APPROVED"
                        )
                      }
                    >
                      {t("timestatement.approve")}
                    </button>

                    <button
                      className="btn-reject"
                      onClick={() =>
                        handleDocumentDecision(
                          timestatement.documentId,
                          internshipId,
                          "DENIED"
                        )
                      }
                    >
                      {t("timestatement.deny")}
                    </button>
                  </div>
                )}

            </div>
          ) : (
            <>
              {isStudent ? (
                <>
                  {internship.status === "ACCEPTED" ? (
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => handleUpload(internshipId, e)}
                      style={{ marginTop: 6 }}
                    />
                  ) : (
                    <span style={{ color: "#666" }}>{t("timestatement.uploadAfterContract")}</span>
                  )}
                </>
              ) : (
                <span style={{ color: "#666" }}>{t("timestatement.missing")}</span>
              )}
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
                  <td>{translateStatus(p.status)}</td>
                </tr>

                {expandedId === p.id && (
                  <tr className="expanded-row">
                    <td colSpan={8}>
                      <div className="expanded-content">
                        <div className="expanded-grid">
                          <div className="detail-item">
                            <strong>{t("internshipTable.detail.student")}:</strong>{" "}
                            {getStudentName(p.studentId)}
                          </div>

                          <div className="detail-item">
                            <strong>{t("internshipTable.detail.company")}:</strong>{" "}
                            {getCompanyName(p.companyId)}
                          </div>

                          <div className="detail-item">
                            <strong>{t("internshipTable.detail.mentor")}:</strong>{" "}
                            {getMentorName(p.mentorId)}
                          </div>

                          <div className="detail-item">
                            <strong>{t("internshipTable.detail.status")}:</strong>{" "}
                            {translateStatus(p.status)}
                          </div>

                          <div className="detail-item">
                            <strong>{t("internshipTable.detail.year")}:</strong> {p.academicYear}
                          </div>

                          <div className="detail-item">
                            <strong>{t("internshipTable.detail.semester")}:</strong> {p.semester}
                          </div>

                          <div className="detail-item">
                            <strong>{t("internshipTable.detail.start")}:</strong>{" "}
                            {new Date(p.dateStart).toLocaleDateString("sk-SK")}
                          </div>

                          <div className="detail-item">
                            <strong>{t("internshipTable.detail.end")}:</strong>{" "}
                            {new Date(p.dateEnd).toLocaleDateString("sk-SK")}
                          </div>

                          <div className="detail-item detail-full">
                            <strong>{t("internshipTable.detail.description")}:</strong>{" "}
                            {p.description || t("internshipTable.detail.noDescription")}
                          </div>
                        </div>

                        {/* ================= STUDENT ================= */}
                        {role === "STUDENT" && (
                          <div className="expanded-section">
                            {(() => {
                              const docs = documents[p.id] || [];
                              const contract = docs.find((d) => d.documentType === "CONTRACT");
                              const timestatement = docs.find((d) => d.documentType === "TIMESTATEMENT");
                              const canUploadTimestatement = Boolean(contract) && p.status === "ACCEPTED";
                              const getContractStatusLabel = (status: string) => {
                              const s = (status || "").toUpperCase();
                              if (s === "CREATED") return t("contract.status.waitingCompany");
                              if (s === "ACCEPTED") return t("contract.status.approved");
                              if (s === "REJECTED") return t("contract.status.denied");
                              return status; 
                            };


                              return (
                                <>
                                  {/* CONTRACT */}
                                  <div className="expanded-card">
                                    <strong>{t("internshipTable.documents.contract")}:</strong>
                                    <div className="expanded-card-body">
                                      {contract ? (
                                      <div className="document-item">
                                        <button
                                          type="button"
                                          className="doc-link"
                                          onClick={() => handleDownloadDocument(contract.documentId, contract.fileName)}
                                        >
                                          {contract.fileName}
                                        </button>
                                        <span className="state-badge">{getContractStatusLabel(translateStatus(p.status))}</span>
                                      </div>
                                    ) : (
                                        <>
                                          <span className="muted">{t("internshipTable.documents.contractMissing")}</span>
                                          <br />
                                          <input
                                            type="file"
                                            accept=".pdf,.doc,.docx"
                                            onChange={(e) => handleUploadContract(p.id, e)}
                                          />
                                        </>
                                      )}
                                    </div>
                                  </div>

                                  {/* TIMESTATEMENT */}
                                  <div className="expanded-card">
                                    <strong>{t("internshipTable.documents.timestatement")}:</strong>
                                    <div className="expanded-card-body">
                                      {timestatement ? (
                                        <div className="document-item">
                                          <button
                                            type="button"
                                            className="doc-link"
                                            onClick={() =>
                                              handleDownloadDocument(timestatement.documentId, timestatement.fileName)
                                            }
                                          >
                                            {timestatement.fileName}
                                          </button>
                                          <span className={`state-badge ${timestatement.currentState?.toLowerCase()}`}>
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
                                        ) : canUploadTimestatement ? (
                                          <input
                                            type="file"
                                            accept="application/pdf"
                                            onChange={(e) => handleUpload(p.id, e)}
                                          />
                                        ) : (
                                          <span className="muted">
                                            {!contract
                                              ? "Najprv nahraj zmluvu o praxi."
                                              : p.status === "CREATED"
                                              ? "Výkaz môžeš nahrať až po potvrdení zmluvy firmou."
                                              : p.status === "REJECTED"
                                              ? "Zmluva bola zamietnutá – nahraj opravenú zmluvu a počkaj na potvrdenie."
                                              : "Výkaz zatiaľ nie je možné nahrať."}
                                          </span>
                                        )}
                                    </div>
                                  </div>
                                </>
                              );
                            })()}
                          </div>
                        )}

                        {/* ================= COMPANY + ADMIN (spoločné) ================= */}
                        {["COMPANY", "ADMIN"].includes(role) && (
                          <div className="expanded-section">{renderDocuments(p)}</div>
                        )}

                        {/* ================= ADMIN ================= */}
                              {role === "ADMIN" && (() => {
                                const st = (p.status || "").toUpperCase();
                                const docs = documents[p.id] || [];
                                const hasContract = docs.some((d: any) => d.documentType === "CONTRACT");

                                const canApproveDeny = ["CREATED", "ACCEPTED"].includes(st); // ak chceš iba CREATED, vyhoď ACCEPTED
                                const canMarkDone = st === "APPROVED";

                                return (
                                  <div className="expanded-actions">
                                    {/* 1) CREATED / ACCEPTED -> APPROVED / DENIED (zmluva netreba) */}
                                    {canApproveDeny && (
                                      <div style={{ marginTop: 10 }}>
                                        {/* Text nad tlačidlami */}
                                        <div style={{ marginBottom: 6, fontWeight: 600 }}>
                                          Zmeniť stav praxe na:
                                        </div>
                                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                        <button
                                          className="btn-accept"
                                          type="button"
                                          onClick={() => handleAdminStateChange(p.id, "APPROVED")}
                                        >
                                          {t("internshipTable.admin.approved")}
                                        </button>

                                        <button
                                          className="btn-reject"
                                          type="button"
                                          onClick={() => handleAdminStateChange(p.id, "DENIED")}
                                        >
                                          {t("internshipTable.admin.denied")}
                                        </button>
                                        </div>
                                      </div>
                                    )}

                                    {/* 2) APPROVED -> PASSED / FAILED (zmluva musí existovať) */}
                                    {canMarkDone && (
                                    <div style={{ marginTop: 10 }}>
                                      {/* Text nad tlačidlami */}
                                      <div style={{ marginBottom: 6, fontWeight: 600 }}>
                                        Zmena stavu praxe:
                                      </div>

                                      {/* Tlačidlá PASSED / FAILED */}
                                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                        <button
                                          className="btn-accept"
                                          type="button"
                                          disabled={!hasContract}
                                          title={!hasContract ? "Najprv musí byť nahraná zmluva o praxi." : ""}
                                          onClick={() => handleAdminStateChange(p.id, "PASSED")}
                                        >
                                          {t("internshipTable.admin.passed")}
                                        </button>

                                        <button
                                          className="btn-reject"
                                          type="button"
                                          disabled={!hasContract}
                                          title={!hasContract ? "Najprv musí byť nahraná zmluva o praxi." : ""}
                                          onClick={() => handleAdminStateChange(p.id, "FAILED")}
                                        >
                                          {t("internshipTable.admin.failed")}
                                        </button>
                                      </div>

                                      {/* Info o zmluve – vždy zobrazené */}
                                      <div style={{ marginTop: 6, color: "#666" }}>
                                        {hasContract
                                          ? "Zmluva o praxi je nahraná – absolvovanie môžeš označiť."
                                          : "Chýba zmluva o praxi – absolvovanie sa nedá označiť."}
                                      </div>
                                    </div>
                                  )}
                                  </div>
                                );
                              })()}

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
