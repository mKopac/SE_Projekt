package sk.team8.odborna_prax_api.dao;

import org.springframework.data.jpa.repository.JpaRepository;
import sk.team8.odborna_prax_api.Entity.InternshipStateChange;
import java.util.Optional;

public interface InternshipStateChangeRepository extends JpaRepository<InternshipStateChange, Integer> {
    Optional<InternshipStateChange> findTopByInternshipIdOrderByStateChangedAtDesc(Integer internshipId);
    Optional<InternshipStateChange> findTopByInternship_IdOrderByStateChangedAtDesc(int internshipId);

}
