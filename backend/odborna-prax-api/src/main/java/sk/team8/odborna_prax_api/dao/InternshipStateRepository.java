package sk.team8.odborna_prax_api.dao;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sk.team8.odborna_prax_api.Entity.InternshipState;

import javax.swing.text.html.Option;
import java.util.Optional;

@Repository
public interface InternshipStateRepository extends JpaRepository<InternshipState, Integer> {
    Optional<InternshipState> findByName(String name);
}
