package sk.team8.odborna_prax_api.dao;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sk.team8.odborna_prax_api.Entity.Documents;
import sk.team8.odborna_prax_api.Entity.TimestatementStateChange;

import java.util.Optional;

@Repository
public interface TimestatementStateChangeRepository extends JpaRepository<TimestatementStateChange, Integer> {
    TimestatementStateChange findTopByDocumentOrderByStateChangedAtDesc(Documents document);
    Optional<TimestatementStateChange> findTopByDocumentIdOrderByStateChangedAtDesc(int documentId);


}
