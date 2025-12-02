package sk.team8.odborna_prax_api.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import sk.team8.odborna_prax_api.Entity.Internship;
import sk.team8.odborna_prax_api.dao.InternshipRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InternshipServiceImpl implements InternshipService {

    private final InternshipRepository internshipRepository;

    @Override
    public List<Internship> findAll() {
        return internshipRepository.findAll();
    }

    @Override
    public List<Internship> findByStudentId(int studentId) {
        return internshipRepository.findByStudentId(studentId);
    }

    @Override
    public List<Internship> findByCompanyId(int companyId) {
        return internshipRepository.findByCompanyId(companyId);
    }
}
