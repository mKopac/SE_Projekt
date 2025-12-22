package sk.team8.odborna_prax_api.Entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.sql.Timestamp;

@Entity
@Table(name = "internship_state_change")
public class InternshipStateChange {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "internship_state_change_id")
    private int id;

    @ManyToOne
    @JoinColumn(name = "internship_id", nullable = false)
    @JsonBackReference("internship-internshipState")
    private Internship internship;

    @ManyToOne
    @JoinColumn(name = "internship_state_id", nullable = false)
    @JsonIgnoreProperties("stateChanges")
    private InternshipState internshipState;


    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "state_changed_at", nullable = false)
    private Timestamp stateChangedAt;


    public InternshipStateChange() {}

    public InternshipStateChange(Internship internship, InternshipState internshipState, User user, Timestamp stateChangedAt) {
        this.internship = internship;
        this.internshipState = internshipState;
        this.user = user;
        this.stateChangedAt = stateChangedAt;
    }


    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public Internship getInternship() {
        return internship;
    }

    public void setInternship(Internship internship) {
        this.internship = internship;
    }

    public InternshipState getInternshipState() {
        return internshipState;
    }

    public void setInternshipState(InternshipState internshipState) {
        this.internshipState = internshipState;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Timestamp getStateChangedAt() {
        return stateChangedAt;
    }

    public void setStateChangedAt(Timestamp stateChangedAt) {
        this.stateChangedAt = stateChangedAt;
    }

    @Override
    public String toString() {
        return "InternshipStateChange{" +
                "id=" + id +
                ", internship=" + internship +
                ", internshipState=" + internshipState +
                ", user=" + user +
                ", stateChangedAt=" + stateChangedAt +
                '}';
    }
}
