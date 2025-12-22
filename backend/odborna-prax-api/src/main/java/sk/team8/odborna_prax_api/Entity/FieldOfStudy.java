package sk.team8.odborna_prax_api.Entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;

import java.util.List;

@Entity
@Table(name = "field_of_study")
public class FieldOfStudy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "field_of_study_id")
    private int id;

    @Column(name = "field_of_study_name", nullable = false, length = 45)
    private String name;

    @OneToMany(mappedBy = "fieldOfStudy")
    @JsonBackReference("fieldofstudy-user")
    private List<User> users;

    public FieldOfStudy() {}

    public FieldOfStudy(String name) {
        this.name = name;
    }

    public FieldOfStudy(int id, String name) {
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

    public List<User> getUsers() {
        return users;
    }

    public void setUsers(List<User> users) {
        this.users = users;
    }

    // toString
    @Override
    public String toString() {
        return "FieldOfStudy{" +
                "id=" + id +
                ", name='" + name + '\'' +
                '}';
    }
}
