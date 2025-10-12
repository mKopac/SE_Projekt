package sk.team8.odborna_prax_api.dao;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sk.team8.odborna_prax_api.Entity.Internship;

@Repository
public interface InternshipRepository extends JpaRepository<Internship, Integer> {
}
