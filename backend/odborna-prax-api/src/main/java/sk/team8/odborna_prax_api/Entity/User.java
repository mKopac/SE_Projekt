package sk.team8.odborna_prax_api.Entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.sql.Timestamp;
import java.util.List;

@Entity
@Table(name="users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="user_id")
    private int id;

    @Column(name = "first_name", length = 50, nullable = false)
    private String firstName;

    @Column(name = "last_name", length = 100, nullable = false)
    private String lastName;

    @Column(name = "email", length = 320, nullable = false, unique = true)
    private String email;

    @Column(name = "email_alternate", length = 320)
    private String emailAlternate;

    @Column(name = "phone_number", length = 13)
    private String phoneNumber;

    @Column(name = "password", length = 100, nullable = false)
    private String password;

    @Column(name = "active", columnDefinition = "TINYINT(1)")
    private boolean active;

    @Column(name = "suspended", columnDefinition = "TINYINT(1)")
    private boolean suspended = false;

    @Column(name = "suspended_at")
    private Timestamp suspendedAt;

    @Column(name = "created_at", updatable = false)
    private Timestamp createdAt;

    @Column(name = "updated_at")
    private Timestamp updatedAt;

    @Column(name = "password_needs_change", columnDefinition = "TINYINT(1)")
    private boolean passwordNeedsChange;

    // ===== RELÁCIE (všetky nechávame NULLable, kým nemáš tabuľky) =====

    @ManyToOne
    @JoinColumn(name = "address_id", nullable = true) // bolo false, nastavujeme na NULLable
    private Address address;

    @ManyToOne
    @JoinColumn(name = "department_id", nullable = true) // NULLable
    private Department department;

    @ManyToOne
    @JoinColumn(name = "field_of_study_id", nullable = true) // NULLable
    private FieldOfStudy fieldOfStudy;

    @ManyToOne
    @JoinColumn(name = "company_id", nullable = true) // NULLable
    private Company company;

    @ManyToOne
    @JoinColumn(name = "role_id", nullable = false) // rolu potrebujeme
    private Role role;

    @JsonIgnore
    @OneToMany(mappedBy = "student")
    private List<Internship> internships;

    @JsonIgnore
    @OneToMany(mappedBy = "user")
    private List<InternshipStateChange> internshipStateChanges;

    @JsonIgnore
    @OneToMany(mappedBy = "employee")
    private List<TimestatementStateChange> timestatementStateChanges;

    public User() {}

    // Student constructor
    public User(int id, String firstName, String lastName, String email, String emailAlternate, String phoneNumber, String password, Address address, boolean active, Timestamp createdAt, Timestamp updatedAt, boolean passwordNeedsChange, FieldOfStudy fieldOfStudy, Role role, List<Internship> internships, List<InternshipStateChange> internshipStateChanges, List<TimestatementStateChange> timestatementStateChanges) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.emailAlternate = emailAlternate;
        this.phoneNumber = phoneNumber;
        this.password = password;
        this.address = address;
        this.active = active;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.passwordNeedsChange = passwordNeedsChange;
        this.fieldOfStudy = fieldOfStudy;
        this.role = role;
        this.internships = internships;
        this.internshipStateChanges = internshipStateChanges;
        this.timestatementStateChanges = timestatementStateChanges;
    }

    // Company constructor
    public User(int id, String firstName, String lastName, String email, String phoneNumber, String password, boolean active, Timestamp createdAt, Timestamp updatedAt, boolean passwordNeedsChange, Company company, Role role, List<InternshipStateChange> internshipStateChanges, List<TimestatementStateChange> timestatementStateChanges) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.password = password;
        this.active = active;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.passwordNeedsChange = passwordNeedsChange;
        this.company = company;
        this.role = role;
        this.internshipStateChanges = internshipStateChanges;
        this.timestatementStateChanges = timestatementStateChanges;
    }

    // Admin Constructor
    public User(int id, String firstName, String lastName, String email, String emailAlternate, String phoneNumber, String password, boolean active, Timestamp createdAt, Timestamp updatedAt, boolean passwordNeedsChange, Department department, Role role, List<InternshipStateChange> internshipStateChanges) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.emailAlternate = emailAlternate;
        this.phoneNumber = phoneNumber;
        this.password = password;
        this.active = active;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.passwordNeedsChange = passwordNeedsChange;
        this.department = department;
        this.role = role;
        this.internshipStateChanges = internshipStateChanges;
    }


    @PrePersist
    protected void onCreate() {
        Timestamp now = new Timestamp(System.currentTimeMillis());
        if (this.createdAt == null) {
            this.createdAt = now;
        }
        if (this.updatedAt == null) {
            this.updatedAt = now;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = new Timestamp(System.currentTimeMillis());
    }


    // Gettery/Settery…

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getEmailAlternate() { return emailAlternate; }
    public void setEmailAlternate(String emailAlternate) { this.emailAlternate = emailAlternate; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }

    public Timestamp getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Timestamp updatedAt) { this.updatedAt = updatedAt; }

    public boolean isPasswordNeedsChange() { return passwordNeedsChange; }
    public void setPasswordNeedsChange(boolean passwordNeedsChange) { this.passwordNeedsChange = passwordNeedsChange; }

    public Address getAddress() { return address; }
    public void setAddress(Address address) { this.address = address; }

    public Department getDepartment() { return department; }
    public void setDepartment(Department department) { this.department = department; }

    public FieldOfStudy getFieldOfStudy() { return fieldOfStudy; }
    public void setFieldOfStudy(FieldOfStudy fieldOfStudy) { this.fieldOfStudy = fieldOfStudy; }

    public Company getCompany() { return company; }
    public void setCompany(Company company) { this.company = company; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public List<Internship> getInternships() { return internships; }
    public void setInternships(List<Internship> internships) { this.internships = internships; }

    public List<InternshipStateChange> getInternshipStateChanges() { return internshipStateChanges; }
    public void setInternshipStateChanges(List<InternshipStateChange> internshipStateChanges) { this.internshipStateChanges = internshipStateChanges; }

    public List<TimestatementStateChange> getTimestatementStateChanges() { return timestatementStateChanges; }
    public void setTimestatementStateChanges(List<TimestatementStateChange> timestatementStateChanges) { this.timestatementStateChanges = timestatementStateChanges; }

    public boolean isSuspended() { return suspended; }
    public void setSuspended(boolean suspended) { this.suspended = suspended; }

    public Timestamp getSuspendedAt() { return suspendedAt; }
    public void setSuspendedAt(Timestamp suspendedAt) { this.suspendedAt = suspendedAt; }

    @Override
    public String toString() {
        return "User{" +
                "id=" + id +
                ", firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", email='" + email + '\'' +
                ", active=" + active +
                ", role=" + (role != null ? role.getName() : null) +
                '}';
    }
}
