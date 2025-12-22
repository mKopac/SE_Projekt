package sk.team8.odborna_prax_api.Entity;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "timestatement_state")
public class TimestatementState {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "timestatement_state_id")
    private int id;

    @Column(name = "timestatement_state_name", nullable = false, length = 25)
    private String name;

    @OneToMany(mappedBy = "timestatementState")
    private List<TimestatementStateChange> stateChanges;

    public TimestatementState() {}

    public TimestatementState(String name) {
        this.name = name;
    }

    public TimestatementState(int id, String name) {
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

    public List<TimestatementStateChange> getStateChanges() {
        return stateChanges;
    }

    public void setStateChanges(List<TimestatementStateChange> stateChanges) {
        this.stateChanges = stateChanges;
    }

    @Override
    public String toString() {
        return "TimestatementState{" +
                "id=" + id +
                ", name='" + name + '\'' +
                '}';
    }
}
