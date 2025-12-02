package sk.team8.odborna_prax_api.service;

import sk.team8.odborna_prax_api.Entity.InternshipStateChange;

import java.util.List;
import java.util.Optional;

public interface InternshipStateChangeService {

    List<InternshipStateChange> findAll();

    Optional<InternshipStateChange> findLatestByInternshipId(int internshipId);
}
