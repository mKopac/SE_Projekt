package sk.team8.odborna_prax_api.Entity;

import jakarta.persistence.*;
import java.sql.Timestamp;

@Entity
@Table(name = "timestatement_state_change")
public class TimestatementStateChange {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "timestatement_state_change_id")
    private int id;

    @ManyToOne
    @JoinColumn(name = "document_id", nullable = false)
    private Documents document;

    @ManyToOne
    @JoinColumn(name = "timestatement_state_id", nullable = false)
    private TimestatementState timestatementState;

    @ManyToOne
    @JoinColumn(name = "employee_id", nullable = false)
    private User employee;

    @Column(name = "state_changed_at", nullable = false)
    private Timestamp stateChangedAt;

    // Constructors
    public TimestatementStateChange() {}

    public TimestatementStateChange(Documents document, TimestatementState timestatementState, User employee, Timestamp stateChangedAt) {
        this.document = document;
        this.timestatementState = timestatementState;
        this.employee = employee;
        this.stateChangedAt = stateChangedAt;
    }

    // Getters & Setters
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public Documents getDocument() {
        return document;
    }

    public void setDocument(Documents document) {
        this.document = document;
    }

    public TimestatementState getTimestatementState() {
        return timestatementState;
    }

    public void setTimestatementState(TimestatementState timestatementState) {
        this.timestatementState = timestatementState;
    }

    public User getEmployee() {
        return employee;
    }

    public void setEmployee(User employee) {
        this.employee = employee;
    }

    public Timestamp getStateChangedAt() {
        return stateChangedAt;
    }

    public void setStateChangedAt(Timestamp stateChangedAt) {
        this.stateChangedAt = stateChangedAt;
    }

    @Override
    public String toString() {
        return "TimestatementStateChange{" +
                "id=" + id +
                ", document=" + document +
                ", timestatementState=" + timestatementState +
                ", employee=" + employee +
                ", stateChangedAt=" + stateChangedAt +
                '}';
    }
}
