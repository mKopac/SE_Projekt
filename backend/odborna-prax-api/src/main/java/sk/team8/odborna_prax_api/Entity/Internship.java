package sk.team8.odborna_prax_api.Entity;

import jakarta.persistence.*;
import java.sql.Date;
import java.sql.Timestamp;
import java.util.List;

@Entity
@Table(name = "internship")
public class Internship {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "internship_id")
    private int id;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @Column(name = "academic_year", nullable = false, length = 9)
    private String academicYear;

    @Column(name = "semester", nullable = false)
    private int semester;

    @Column(name = "date_start", nullable = false)
    private Date dateStart;

    @Column(name = "date_end", nullable = false)
    private Date dateEnd;

    @Column(name = "created_at", updatable = false)
    private Timestamp createdAt;

    @Column(name = "updated_at")
    private Timestamp updatedAt;

    // Relationships
    @OneToMany(mappedBy = "internship")
    private List<InternshipStateChange> internshipStateChanges;

    @OneToMany(mappedBy = "internship")
    private List<Documents> documents;

    // Constructors
    public Internship() {}

    public Internship(User student, Company company, String academicYear, int semester, Date dateStart, Date dateEnd) {
        this.student = student;
        this.company = company;
        this.academicYear = academicYear;
        this.semester = semester;
        this.dateStart = dateStart;
        this.dateEnd = dateEnd;
    }

    // Getters & Setters
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public User getStudent() {
        return student;
    }

    public void setStudent(User student) {
        this.student = student;
    }

    public Company getCompany() {
        return company;
    }

    public void setCompany(Company company) {
        this.company = company;
    }

    public String getAcademicYear() {
        return academicYear;
    }

    public void setAcademicYear(String academicYear) {
        this.academicYear = academicYear;
    }

    public int getSemester() {
        return semester;
    }

    public void setSemester(int semester) {
        this.semester = semester;
    }

    public Date getDateStart() {
        return dateStart;
    }

    public void setDateStart(Date dateStart) {
        this.dateStart = dateStart;
    }

    public Date getDateEnd() {
        return dateEnd;
    }

    public void setDateEnd(Date dateEnd) {
        this.dateEnd = dateEnd;
    }

    public Timestamp getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }

    public Timestamp getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Timestamp updatedAt) {
        this.updatedAt = updatedAt;
    }

    public List<InternshipStateChange> getInternshipStateChanges() {
        return internshipStateChanges;
    }

    public void setInternshipStateChanges(List<InternshipStateChange> internshipStateChanges) {
        this.internshipStateChanges = internshipStateChanges;
    }

    public List<Documents> getDocuments() {
        return documents;
    }

    public void setDocuments(List<Documents> documents) {
        this.documents = documents;
    }

    @Override
    public String toString() {
        return "Internship{" +
                "id=" + id +
                ", student=" + student +
                ", company=" + company +
                ", academicYear='" + academicYear + '\'' +
                ", semester=" + semester +
                ", dateStart=" + dateStart +
                ", dateEnd=" + dateEnd +
                '}';
    }
}
