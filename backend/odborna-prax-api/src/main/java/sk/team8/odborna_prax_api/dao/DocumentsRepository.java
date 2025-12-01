package sk.team8.odborna_prax_api.dao;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import sk.team8.odborna_prax_api.Entity.Documents;

import java.util.List;

@Repository
public interface DocumentsRepository extends JpaRepository<Documents, Integer> {
    List<Documents> findByInternshipId(Integer internshipId);
    

}
