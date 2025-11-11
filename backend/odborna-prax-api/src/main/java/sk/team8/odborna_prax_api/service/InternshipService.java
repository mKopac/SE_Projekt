package sk.team8.odborna_prax_api.service;

import sk.team8.odborna_prax_api.Entity.Internship;
import java.util.List;

public interface InternshipService {

    List<Internship> findAll();

    List<Internship> findByStudentId(int studentId);

    List<Internship> findByCompanyId(int companyId);
}
