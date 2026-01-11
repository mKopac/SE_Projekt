package sk.team8.odborna_prax_api.service;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import sk.team8.odborna_prax_api.Entity.*;
import sk.team8.odborna_prax_api.dao.AddressRepository;
import sk.team8.odborna_prax_api.dao.FieldOfStudyRepository;
import sk.team8.odborna_prax_api.dao.RoleRepository;
import sk.team8.odborna_prax_api.dao.UserRepository;
import sk.team8.odborna_prax_api.dto.StudentRegisterRequest;

@Service
@RequiredArgsConstructor
public class StudentRegistrationService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final FieldOfStudyRepository fieldOfStudyRepository;
    private final AddressRepository addressRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthTokenService authTokenService;
    private final EmailService emailService;
    private final PasswordGeneratorService passwordGeneratorService;

    @Transactional
    public void registerStudent(StudentRegisterRequest req) {

        userRepository.findByEmail(req.getStudentEmail()).ifPresent(u -> {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Používateľ s týmto e-mailom už existuje.");
        });

        Role studentRole = roleRepository.findByName("STUDENT")
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                        "Rola STUDENT neexistuje v databáze."));

        Address address = new Address();
        address.setCity(req.getCity());
        address.setStreet(req.getAddress());
        address.setZip(req.getZip());
        addressRepository.save(address);

        User u = new User();
        u.setFirstName(req.getFirstName());
        u.setLastName(req.getLastName());
        u.setEmail(req.getStudentEmail());
        u.setEmailAlternate(req.getEmailAlternate());
        u.setPhoneNumber(req.getPhoneNumber());
        u.setAddress(address);
        u.setActive(false);
        u.setPasswordNeedsChange(true);
        u.setRole(studentRole);

        if (req.getFieldOfStudyId() != null) {
            FieldOfStudy field = fieldOfStudyRepository.findById(req.getFieldOfStudyId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "Neplatný ID študijného odboru: " + req.getFieldOfStudyId()));
            u.setFieldOfStudy(field);
        }

        String rawPassword = passwordGeneratorService.generatePassword(10);
        u.setPassword(passwordEncoder.encode(rawPassword));
        userRepository.save(u);

        AuthToken token = authTokenService.createToken(u, TokenType.EMAIL_VERIFICATION, 24);
        String verificationLink = "https://localhost:8443/auth/verify-email?token=" + token.getToken();

        String subject = "Aktivácia účtu – Odborná prax";
        String body = "Dobrý deň " + u.getFirstName() + ",\n\n" +
                "ďakujeme za registráciu v systéme odbornej praxe.\n\n" +
                "Na aktiváciu účtu kliknite na nasledujúci odkaz:\n" +
                verificationLink + "\n\n" +
                "Vaše dočasné heslo pre prihlásenie je:\n" + rawPassword + "\n\n" +
                "Platnosť odkazu: 24 hodín. Po aktivácii odporúčame zmeniť heslo.";

        emailService.sendEmail(u.getEmail(), subject, body);
    }
}
