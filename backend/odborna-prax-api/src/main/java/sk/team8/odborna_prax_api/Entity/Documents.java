package sk.team8.odborna_prax_api.Entity;

import jakarta.persistence.*;
import java.sql.Timestamp;
import java.util.List;

@Entity
@Table(name = "documents")
public class Documents {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "document_id")
    private int id;

    @ManyToOne
    @JoinColumn(name = "document_type_id", nullable = false)
    private DocumentType documentType;

    @ManyToOne
    @JoinColumn(name = "internship_id", nullable = false)
    private Internship internship;

    @Column(name = "document_name", nullable = false, length = 255)
    private String documentName;

    @Column(name = "uploaded_at", nullable = false)
    private Timestamp uploadedAt;

    @OneToMany(mappedBy = "document")
    private List<TimestatementStateChange> timestatementStateChanges;

    public Documents() {}

    public Documents(DocumentType documentType, Internship internship, String documentName, Timestamp uploadedAt) {
        this.documentType = documentType;
        this.internship = internship;
        this.documentName = documentName;
        this.uploadedAt = uploadedAt;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public DocumentType getDocumentType() {
        return documentType;
    }

    public void setDocumentType(DocumentType documentType) {
        this.documentType = documentType;
    }

    public Internship getInternship() {
        return internship;
    }

    public void setInternship(Internship internship) {
        this.internship = internship;
    }

    public String getDocumentName() {
        return documentName;
    }

    public void setDocumentName(String documentName) {
        this.documentName = documentName;
    }

    public Timestamp getUploadedAt() {
        return uploadedAt;
    }

    public void setUploadedAt(Timestamp uploadedAt) {
        this.uploadedAt = uploadedAt;
    }

    public List<TimestatementStateChange> getTimestatementStateChanges() {
        return timestatementStateChanges;
    }

    public void setTimestatementStateChanges(List<TimestatementStateChange> timestatementStateChanges) {
        this.timestatementStateChanges = timestatementStateChanges;
    }

    @Override
    public String toString() {
        return "Documents{" +
                "id=" + id +
                ", documentName='" + documentName + '\'' +
                ", uploadedAt=" + uploadedAt +
                '}';
    }
}
