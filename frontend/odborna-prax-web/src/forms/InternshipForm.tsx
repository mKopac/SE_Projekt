import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "./../css/InternshipForm.css";

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
  description?: string;
}

interface Props {
  onAdd: (internship: any) => void;
}

const baseUrl = "http://localhost:8080";

const InternshipForm: React.FC<Props> = ({ onAdd }) => {
  const { t } = useTranslation("dashboard");

  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [companyInput, setCompanyInput] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [filteredMentors, setFilteredMentors] = useState<Mentor[]>([]);
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
    internshipType: string;
    description: string;
  };

  const [form, setForm] = useState<InternshipFormData>({
    companyId: 0,
    mentorId: 0,
    academicYear: "",
    semester: 1,
    dateStart: "",
    dateEnd: "",
    internshipType: "",
    description: "",
  });

  useEffect(() => {
    fetch(`${baseUrl}/dashboard/companies`, { headers })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setCompanies(Array.isArray(data) ? data : []);
        setFilteredCompanies(Array.isArray(data) ? data : []);
      });

    fetch(`${baseUrl}/dashboard/mentors`, { headers })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setMentors(Array.isArray(data) ? data : []));

    fetch(`${baseUrl}/auth/me`, { headers })
      .then((res) => (res.ok ? res.json() : null))
      .then((user) => setCurrentUserId(user?.id ?? null));

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
    setForm((prev) => ({ ...prev, academicYear: `${startYear}/${endYear}` }));
  }, []);

  // FULLTEXT FILTER
  const handleCompanySearch = (text: string) => {
    setCompanyInput(text);
    setShowDropdown(true);

    const filtered = companies.filter((c) =>
      c.name.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredCompanies(filtered);
  };

  const selectCompany = (company: Company) => {
    setCompanyInput(company.name);
    setForm((prev) => ({ ...prev, companyId: company.id }));
    setShowDropdown(false);

    fetch(`${baseUrl}/dashboard/mentors?companyId=${company.id}`, { headers })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setMentors(data);
        setFilteredMentors(data);
      });
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: name === "semester" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUserId) {
      alert(t("internshipForm.alerts.userLoadFailed"));
      return;
    }

    if (form.companyId === 0) {
      alert(t("internshipForm.alerts.mustSelectCompany"));
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
      alert(
        t("internshipForm.alerts.saveError", {
          error: data.error ?? t("internshipForm.alerts.unknownError"),
        })
      );
      return;
    }

    alert(t("internshipForm.alerts.createdOk"));

    if (form.internshipType === "new") {
      try {
        const token = localStorage.getItem("token");

        const resTemplate = await fetch(
          `${baseUrl}/documents/contracts/template`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!resTemplate.ok) {
          console.error(t("internshipForm.console.templateDownloadFailed"));
        } else {
          const blob = await resTemplate.blob();
          const url = window.URL.createObjectURL(blob);

          const a = document.createElement("a");
          a.href = url;
          a.download = "Ziadost_o_prax.docx"; // názov súboru pre usera
          document.body.appendChild(a);
          a.click();
          a.remove();
          window.URL.revokeObjectURL(url);
        }
      } catch (e) {
        console.error(t("internshipForm.console.templateDownloadError"), e);
      }
    }

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
      internshipType: "",
      description: "",
    });

    setCompanyInput("");
  };

  return (
    <form className="practice-form" onSubmit={handleSubmit}>
      <h3>{t("internshipForm.title")}</h3>

      <div className="form-group" style={{ position: "relative" }}>
        <label>{t("internshipForm.fields.company.label")}</label>
        <input
          type="text"
          placeholder={t("internshipForm.fields.company.placeholder")}
          value={companyInput}
          onChange={(e) => handleCompanySearch(e.target.value)}
          onFocus={() => setShowDropdown(true)}
          required
        />

        {showDropdown && filteredCompanies.length > 0 && (
          <ul className="autocomplete-list">
            {filteredCompanies.map((c) => (
              <li
                key={c.id}
                onClick={() => selectCompany(c)}
                className="autocomplete-item"
              >
                {c.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="form-group">
        <label>{t("internshipForm.fields.mentor.label")}</label>
        <select
          name="mentorId"
          value={form.mentorId}
          onChange={handleChange}
          required
          disabled={form.companyId === 0}
        >
          <option value="">
            {t("internshipForm.fields.mentor.firstSelectCompany")}
          </option>
          {mentors.map((m) => (
            <option key={m.id} value={m.id}>
              {m.firstName} {m.lastName}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>{t("internshipForm.fields.academicYear.label")}</label>
        <input name="academicYear" value={form.academicYear} readOnly />
      </div>

      <div className="form-group">
        <label>{t("internshipForm.fields.semester.label")}</label>
        <select name="semester" value={form.semester} onChange={handleChange}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>

      <div className="date-row">
        <div className="form-group">
          <label>{t("internshipForm.fields.start.label")}</label>
          <input
            type="date"
            name="dateStart"
            value={form.dateStart}
            onChange={handleChange}
            required
            // NEW: if end is selected first, start cannot be after end
            max={form.dateEnd || undefined}
          />
        </div>

        <div className="form-group">
          <label>{t("internshipForm.fields.end.label")}</label>
          <input
            type="date"
            name="dateEnd"
            value={form.dateEnd}
            onChange={handleChange}
            required
            // NEW: if start is selected first, end cannot be before start
            min={form.dateStart || undefined}
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="font-semibold">
          {t("internshipForm.fields.type.label")}
        </label>

        <div className="flex gap-4 mt-2">
          <label>
            <input
              type="radio"
              name="internshipType"
              value="new"
              checked={form.internshipType === "new"}
              onChange={() => setForm({ ...form, internshipType: "new" })}
            />
            &nbsp;{t("internshipForm.fields.type.new")}
          </label>

          <label>
            <input
              type="radio"
              name="internshipType"
              value="existing"
              checked={form.internshipType === "existing"}
              onChange={() => setForm({ ...form, internshipType: "existing" })}
            />
            &nbsp;{t("internshipForm.fields.type.existing")}
          </label>
        </div>
      </div>

      <div className="form-group">
        <label>{t("internshipForm.fields.description.label")}</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={3}
        ></textarea>
      </div>

      <button type="submit" className="btn-save">
        {t("internshipForm.actions.save")}
      </button>
    </form>
  );
};

export default InternshipForm;
