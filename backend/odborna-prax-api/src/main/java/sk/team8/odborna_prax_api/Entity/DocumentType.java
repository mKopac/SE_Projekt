package sk.team8.odborna_prax_api.Entity;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "document_type")
public class DocumentType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "document_type_id")
    private int id;

    @Column(name = "document_type_name", nullable = false, length = 25)
    private String name;

    @OneToMany(mappedBy = "documentType")
    private List<Documents> documents;

    public DocumentType() {}

    public DocumentType(String name) {
        this.name = name;
    }

    public DocumentType(int id, String name) {
        this.id = id;
        this.name = name;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<Documents> getDocuments() {
        return documents;
    }

    public void setDocuments(List<Documents> documents) {
        this.documents = documents;
    }

    @Override
    public String toString() {
        return "DocumentType{" +
                "id=" + id +
                ", name='" + name + '\'' +
                '}';
    }
}
