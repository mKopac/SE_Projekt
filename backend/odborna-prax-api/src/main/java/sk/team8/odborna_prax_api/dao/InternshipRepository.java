package sk.team8.odborna_prax_api.dao;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import sk.team8.odborna_prax_api.Entity.Internship;

import java.util.List;

@Repository
public interface InternshipRepository extends JpaRepository<Internship, Integer> {
    List<Internship> findByStudentId(int studentId);
    List<Internship> findByCompanyId(int companyId);

    @Query("""
            SELECT i FROM Internship i
            LEFT JOIN i.student s
            LEFT JOIN i.company c
            LEFT JOIN i.mentor m
            WHERE (:companyId IS NULL OR i.company.id = :companyId)
              AND (:mentorId IS NULL OR m.id = :mentorId)
              AND (:academicYear IS NULL OR i.academicYear = :academicYear)
              AND (:semester IS NULL OR i.semester = :semester)
              AND (
                    :search IS NULL 
                    OR LOWER(s.firstName) LIKE LOWER(CONCAT('%', :search, '%'))
                    OR LOWER(s.lastName) LIKE LOWER(CONCAT('%', :search, '%'))
                    OR LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%'))
                    OR LOWER(m.firstName) LIKE LOWER(CONCAT('%', :search, '%'))
                    OR LOWER(m.lastName) LIKE LOWER(CONCAT('%', :search, '%'))
                  )
            """)
    List<Internship> filterInternships(
            @Param("companyId") Integer companyId,
            @Param("mentorId") Integer mentorId,
            @Param("academicYear") String academicYear,
            @Param("semester") Integer semester,
            @Param("search") String search
    );
}
