package sk.team8.odborna_prax_api.controller;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import sk.team8.odborna_prax_api.Entity.*;
import sk.team8.odborna_prax_api.dao.UserRepository;
import sk.team8.odborna_prax_api.dto.*;
import sk.team8.odborna_prax_api.service.*;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AdminRegistrationService adminRegistrationService;
    private final AuthService authService;
    private final AuthTokenService authTokenService;
    private final EmailService emailService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final StudentRegistrationService studentRegistrationService;
    private final CompanyRegistrationService companyRegistrationService;
    private final PasswordChangeService passwordChangeService;
    private final UserService userService;

    public AuthController(
            AdminRegistrationService adminRegistrationService,
            AuthService authService,
            AuthTokenService authTokenService,
            EmailService emailService,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            StudentRegistrationService studentRegistrationService,
            CompanyRegistrationService companyRegistrationService,
            PasswordChangeService passwordChangeService,
            UserService userService
    ) {
        this.adminRegistrationService = adminRegistrationService;
        this.authService = authService;
        this.authTokenService = authTokenService;
        this.emailService = emailService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.studentRegistrationService = studentRegistrationService;
        this.companyRegistrationService = companyRegistrationService;
        this.passwordChangeService = passwordChangeService;
        this.userService = userService;
    }

    @PostMapping("/register/admin")
    public ResponseEntity<?> registerAdmin(@RequestBody AdminRegisterRequest req) {
        try {
            adminRegistrationService.register(req);
            return ResponseEntity.status(HttpStatus.CREATED).build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/register/student")
    public ResponseEntity<?> registerStudent(@RequestBody @Valid StudentRegisterRequest request) {
        studentRegistrationService.registerStudent(request);
        return ResponseEntity.ok(
                Map.of("message", "Registrácia prebehla úspešne. Potvrdzovací e-mail bol odoslaný.")
        );
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            String token = authService.login(request.getEmail(), request.getPassword());

            User user = authService.findUserByEmail(request.getEmail())
                    .orElseThrow(() -> new IllegalArgumentException("Používateľ neexistuje."));

            return ResponseEntity.ok(Map.of(
                    "access_token", token,
                    "token_type", "Bearer",
                    "passwordNeedsChange", user.isPasswordNeedsChange(),
                    "password_needs_change", user.isPasswordNeedsChange(),
                    "user", Map.of(
                            "id", user.getId(),
                            "email", user.getEmail(),
                            "firstName", user.getFirstName(),
                            "lastName", user.getLastName(),
                            "role", user.getRole().getName(),
                            "suspended", user.isSuspended(),
                            "passwordNeedsChange", user.isPasswordNeedsChange(),
                            "password_needs_change", user.isPasswordNeedsChange()
                    )
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Nastala chyba pri prihlasovaní"));
        }
    }

    @PostMapping("/request-password-reset")
    public ResponseEntity<?> requestPasswordReset(@RequestBody Map<String, String> request) {
        String email = request.get("email");

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Používateľ s týmto e-mailom neexistuje."));
        }

        User user = userOpt.get();

        AuthToken token = authTokenService.createToken(user, TokenType.PASSWORD_RESET, 1);

        String link = "http://localhost:5173/reset-password?token=" + token.getToken();

        emailService.sendEmail(
                user.getEmail(),
                "Obnovenie hesla – Odborná prax",
                "Dobrý deň,\n\nKliknite na tento odkaz pre obnovenie hesla:\n"
                        + link + "\n\nPlatnosť odkazu: 1 hodina."
        );

        return ResponseEntity.ok(Map.of("message", "E-mail s odkazom bol odoslaný."));
    }

    @GetMapping("/verify-reset-token")
    public ResponseEntity<?> verifyResetToken(@RequestParam String token) {
        var tokenOpt = authTokenService.validateToken(token, TokenType.PASSWORD_RESET);

        if (tokenOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("valid", false, "error", "Odkaz na obnovenie hesla je neplatný alebo expiroval."));
        }

        return ResponseEntity.ok(Map.of("valid", true));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> body) {
        String tokenValue = body.get("token");
        String newPassword = body.get("newPassword");

        var tokenOpt = authTokenService.validateToken(tokenValue, TokenType.PASSWORD_RESET);
        if (tokenOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Token je neplatný alebo expiroval."));
        }

        AuthToken token = tokenOpt.get();
        User user = token.getUser();

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        authTokenService.markTokenAsUsed(token);

        return ResponseEntity.ok(Map.of("message", "Heslo bolo úspešne zmenené."));
    }

    @GetMapping("/verify-email")
    public void verifyEmail(@RequestParam("token") String token,
                            HttpServletResponse response) throws IOException {

        var tokenOpt = authTokenService.validateToken(token, TokenType.EMAIL_VERIFICATION);

        if (tokenOpt.isEmpty()) {
            response.sendRedirect("http://localhost:5173/login?verification=error");
            return;
        }

        AuthToken authToken = tokenOpt.get();
        User user = authToken.getUser();

        user.setActive(true);
        userRepository.save(user);
        authTokenService.markTokenAsUsed(authToken);

        response.sendRedirect("http://localhost:5173/login?verification=success");
    }

    @PostMapping("/register/company")
    public ResponseEntity<?> registerCompany(@Valid @RequestBody CompanyRegisterRequest request) {
        companyRegistrationService.registerCompany(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(Map.of("message", "Registrácia spoločnosti prebehla úspešne. Potvrdzovací e-mail bol odoslaný."));
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody ChangePasswordRequest request) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Missing or invalid Authorization header"));
            }

            String token = authHeader.substring(7);

            if (!authService.isTokenValid(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Invalid or expired token"));
            }

            String userEmail = authService.extractEmailFromToken(token);
            User user = authService.findUserByEmail(userEmail)
                    .orElseThrow(() -> new IllegalArgumentException("Používateľ neexistuje."));

            passwordChangeService.changePassword(user, request);
            return ResponseEntity.ok(Map.of("message", "Heslo bolo úspešne zmenené."));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Nastala chyba pri zmene hesla."));
        }
    }

    @PostMapping("/force-change-password")
    public ResponseEntity<?> forceChangePassword(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody ChangePasswordRequest request) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Missing or invalid Authorization header"));
        }

        String token = authHeader.substring(7);
        if (!authService.isTokenValid(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid or expired token"));
        }

        String email = authService.extractEmailFromToken(token);
        User user = authService.findUserByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Používateľ neexistuje."));

        if (!user.isPasswordNeedsChange()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Zmena hesla nie je povolená."));
        }

        if (request.getNewPassword() == null || request.getNewPassword().isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Nové heslo nesmie byť prázdne."));
        }

        if (!request.getNewPassword().equals(request.getRepeatNewPassword())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Heslá sa nezhodujú."));
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setPasswordNeedsChange(false);
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Heslo bolo úspešne zmenené."));
    }

    @GetMapping("/study-programs")
    public ResponseEntity<?> getAllStudyPrograms() {
        try {
            List<FieldOfStudy> programs = userService.getAllStudyPrograms();

            List<Map<String, Object>> response = programs.stream()
                    .map(p -> {
                        Map<String, Object> map = new HashMap<>();
                        map.put("id", p.getId());
                        map.put("name", p.getName());
                        return map;
                    })
                    .toList();

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Chyba pri načítavaní študijných odborov"));
        }
    }

    @GetMapping("/companies")
    public ResponseEntity<?> getAllCompanies() {
        try {
            List<Company> companies = companyRegistrationService.getAllCompanies();

            List<Map<String, Object>> response = companies.stream()
                    .map(c -> {
                        Map<String, Object> map = new HashMap<>();
                        map.put("id", c.getId());
                        map.put("name", c.getName());
                        return map;
                    })
                    .toList();

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Chyba pri načítavaní firiem"));
        }
    }

        @GetMapping("/me")
    public ResponseEntity<?> me(org.springframework.security.core.Authentication authentication) {

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Unauthorized or missing token"));
        }

        String email = authentication.getName();

        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "User not found"));
        }

        User user = userOpt.get();

        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "email", user.getEmail(),
                "firstName", user.getFirstName(),
                "lastName", user.getLastName(),
                "role", user.getRole()
        ));
    }


}
