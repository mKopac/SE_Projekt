package sk.team8.odborna_prax_api.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import sk.team8.odborna_prax_api.Entity.InternshipStateChange;
import sk.team8.odborna_prax_api.dao.InternshipStateChangeRepository;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class InternshipStateChangeServiceImpl implements InternshipStateChangeService {

    private final InternshipStateChangeRepository internshipStateChangeRepository;

    @Override
    public List<InternshipStateChange> findAll() {
        return internshipStateChangeRepository.findAll();
    }

    @Override
    public Optional<InternshipStateChange> findLatestByInternshipId(int internshipId) {
        return internshipStateChangeRepository.findTopByInternshipIdOrderByStateChangedAtDesc(internshipId);
    }
}
