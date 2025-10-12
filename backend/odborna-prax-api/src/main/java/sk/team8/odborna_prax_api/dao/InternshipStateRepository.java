package sk.team8.odborna_prax_api.dao;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sk.team8.odborna_prax_api.Entity.InternshipState;

@Repository
public interface InternshipStateRepository extends JpaRepository<InternshipState, Integer> {
}
