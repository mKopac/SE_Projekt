package sk.team8.odborna_prax_api.Entity;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "internship_state")
public class InternshipState {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "internship_state_id")
    private int id;

    @Column(name = "internship_state_name", nullable = false, length = 25)
    private String name;

    // Relationships
    @OneToMany(mappedBy = "internshipState")
    private List<InternshipStateChange> stateChanges;

    // Constructors
    public InternshipState() {}

    public InternshipState(String name) {
        this.name = name;
    }

    public InternshipState(int id, String name) {
        this.id = id;
        this.name = name;
    }

    // Getters & Setters
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

    public List<InternshipStateChange> getStateChanges() {
        return stateChanges;
    }

    public void setStateChanges(List<InternshipStateChange> stateChanges) {
        this.stateChanges = stateChanges;
    }

    @Override
    public String toString() {
        return "InternshipState{" +
                "id=" + id +
                ", name='" + name + '\'' +
                '}';
    }
}
