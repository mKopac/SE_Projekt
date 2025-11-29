package sk.team8.odborna_prax_api.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sk.team8.odborna_prax_api.Entity.Role;
import sk.team8.odborna_prax_api.Entity.User;
import sk.team8.odborna_prax_api.Entity.TokenType;
import sk.team8.odborna_prax_api.dao.RoleRepository;
import sk.team8.odborna_prax_api.dao.UserRepository;
import sk.team8.odborna_prax_api.dto.AdminRegisterRequest;

@Service
public class AdminRegistrationService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthTokenService authTokenService;
    private final EmailService emailService;
    private final PasswordGeneratorService passwordGeneratorService;

    public AdminRegistrationService(UserRepository userRepository,
                                    RoleRepository roleRepository,
                                    PasswordEncoder passwordEncoder,
                                    AuthTokenService authTokenService,
                                    EmailService emailService,
                                    PasswordGeneratorService passwordGeneratorService
    ) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.authTokenService = authTokenService;
        this.emailService = emailService;
        this.passwordGeneratorService = passwordGeneratorService;
    }

    @Transactional
    public void register(AdminRegisterRequest req) {

        if (req.getEmail() == null || !req.getEmail().contains("@")) {
            throw new IllegalArgumentException("Neplatný email");
        }

        if (userRepository.existsByEmail(req.getEmail())) {
            throw new IllegalStateException("Email už existuje");
        }

        Role adminRole = roleRepository.findByName("ADMIN")
                .orElseThrow(() -> new IllegalStateException("Rola ADMIN neexistuje"));

        String rawPassword = passwordGeneratorService.generatePassword(12);

        User u = new User();
        u.setFirstName(req.getFirstName());
        u.setLastName(req.getLastName());
        u.setEmail(req.getEmail());
        u.setPassword(passwordEncoder.encode(rawPassword));
        u.setPhoneNumber(req.getPhoneNumber());
        u.setActive(false);
        u.setPasswordNeedsChange(true);
        u.setRole(adminRole);

        userRepository.save(u);

        var token = authTokenService.createToken(u, TokenType.EMAIL_VERIFICATION, 1);

        String verifyLink = "http://localhost:8080/auth/verify-email?token=" + token.getToken();

        String body =
                "Dobrý deň,\n\n" +
                        "Váš admin účet bol vytvorený.\n\n" +
                        "Prihlasovacie meno: " + u.getEmail() + "\n" +
                        "Dočasné heslo: " + rawPassword + "\n\n" +
                        "Pred prihlásením musíte aktivovať svoj účet kliknutím na tento odkaz:\n" +
                        verifyLink + "\n\n" +
                        "Tento odkaz je platný 1 hodinu.\n\n" +
                        "Po aktivovaní Vašeho účtu odporúčame heslo zmeniť :)\n";

        emailService.sendEmail(
                u.getEmail(),
                "Aktivácia admin účtu",
                body
        );
    }
}
