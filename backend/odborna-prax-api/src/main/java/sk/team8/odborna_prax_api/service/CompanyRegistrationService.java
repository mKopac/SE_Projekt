package sk.team8.odborna_prax_api.service;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import sk.team8.odborna_prax_api.Entity.Address;
import sk.team8.odborna_prax_api.Entity.AuthToken;
import sk.team8.odborna_prax_api.Entity.Company;
import sk.team8.odborna_prax_api.Entity.Role;
import sk.team8.odborna_prax_api.Entity.TokenType;
import sk.team8.odborna_prax_api.Entity.User;
import sk.team8.odborna_prax_api.dao.AddressRepository;
import sk.team8.odborna_prax_api.dao.CompanyRepository;
import sk.team8.odborna_prax_api.dao.RoleRepository;
import sk.team8.odborna_prax_api.dao.UserRepository;
import sk.team8.odborna_prax_api.dto.CompanyRegisterRequest;

@Service
public class CompanyRegistrationService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final CompanyRepository companyRepository;
    private final AddressRepository addressRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthTokenService authTokenService;
    private final EmailService emailService;
    private final PasswordGeneratorService passwordGeneratorService;

    public CompanyRegistrationService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            CompanyRepository companyRepository,
            AddressRepository addressRepository,
            PasswordEncoder passwordEncoder,
            AuthTokenService authTokenService,
            EmailService emailService,
            PasswordGeneratorService passwordGeneratorService
    ) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.companyRepository = companyRepository;
        this.addressRepository = addressRepository;
        this.passwordEncoder = passwordEncoder;
        this.authTokenService = authTokenService;
        this.emailService = emailService;
        this.passwordGeneratorService = passwordGeneratorService;
    }

    @Transactional
    public void registerCompany(CompanyRegisterRequest req) {

        if (req.getStudentEmail() == null || req.getStudentEmail().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Email je povinný."
            );
        }

        if (userRepository.findByEmail(req.getStudentEmail()).isPresent()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Používateľ s týmto e-mailom už existuje."
            );
        }

        Role companyRole = roleRepository.findByName("COMPANY")
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.INTERNAL_SERVER_ERROR,
                        "Rola COMPANY neexistuje v databáze."
                ));

        Address contactAddress = new Address();
        contactAddress.setStreet(req.getAddress());
        contactAddress.setCity(req.getCity());
        contactAddress.setZip(req.getZip());
        addressRepository.save(contactAddress);

        Company company;

        String firmType = req.getFirmType() != null ? req.getFirmType().toLowerCase() : "";

        if ("existujuca".equals(firmType)) {

            if (req.getCompanyId() == null) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Musíte zvoliť existujúcu firmu."
                );
            }

            company = companyRepository.findById(req.getCompanyId())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "Zvolená firma neexistuje."
                    ));

        } else if ("nova".equals(firmType)) {


            Address companyAddress = new Address();
            companyAddress.setStreet(req.getStreet());
            companyAddress.setCity(req.getCity());
            companyAddress.setZip(req.getZip());
            addressRepository.save(companyAddress);

            company = new Company();
            company.setName(req.getCompanyName());
            company.setCompany_identification_number(
                    req.getCompanyIdentificationNumber()
            );
            company.setAddress(companyAddress);
            companyRepository.save(company);

        } else {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Neplatný typ firmy."
            );
        }

        User u = new User();
        u.setFirstName(req.getFirstName());
        u.setLastName(req.getLastName());
        u.setEmail(req.getStudentEmail());
        u.setEmailAlternate(req.getEmailAlternate());
        u.setPhoneNumber(req.getPhoneNumber());
        u.setAddress(contactAddress);
        u.setCompany(company);
        u.setRole(companyRole);
        u.setActive(false);
        u.setPasswordNeedsChange(true);


        String rawPassword = passwordGeneratorService.generatePassword(10);
        u.setPassword(passwordEncoder.encode(rawPassword));

        userRepository.save(u);


        AuthToken token = authTokenService.createToken(u, TokenType.EMAIL_VERIFICATION, 24
        );

        String verificationLink =
                "http://localhost:8080/auth/verify-email?token=" + token.getToken();

        String subject = "Aktivácia účtu firmy – Odborná prax";
        String body = "Dobrý deň " + u.getFirstName() + " " + u.getLastName() + ",\n\n" +
                "ďakujeme za registráciu Vašej spoločnosti v systéme odbornej praxe.\n\n" +
                "Na aktiváciu účtu, prosím, kliknite na nasledujúci odkaz:\n" +
                verificationLink + "\n\n" +
                "Vaše dočasné heslo pre prihlásenie je:\n" +
                rawPassword + "\n\n" +
                "Link pre aktiváciu účtu je platný24 hodín.";

        emailService.sendEmail(u.getEmail(), subject, body);
    }
}
