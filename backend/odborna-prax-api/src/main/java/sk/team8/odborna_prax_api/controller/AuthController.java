package sk.team8.odborna_prax_api.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import sk.team8.odborna_prax_api.Entity.AuthToken;
import sk.team8.odborna_prax_api.Entity.TokenType;
import sk.team8.odborna_prax_api.Entity.User;
import sk.team8.odborna_prax_api.dao.UserRepository;
import sk.team8.odborna_prax_api.dto.AdminRegisterRequest;
import sk.team8.odborna_prax_api.dto.ChangePasswordRequest;
import sk.team8.odborna_prax_api.dto.LoginRequest;
import sk.team8.odborna_prax_api.service.AdminRegistrationService;
import sk.team8.odborna_prax_api.service.AuthService;
import sk.team8.odborna_prax_api.service.AuthTokenService;
import sk.team8.odborna_prax_api.service.EmailService;

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

    public AuthController(
            AdminRegistrationService adminRegistrationService,
            AuthService authService,
            AuthTokenService authTokenService,
            EmailService emailService,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.adminRegistrationService = adminRegistrationService;
        this.authService = authService;
        this.authTokenService = authTokenService;
        this.emailService = emailService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
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

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            String token = authService.login(request.getEmail(), request.getPassword());
            return ResponseEntity.ok(Map.of(
                    "access_token", token,
                    "token_type", "Bearer"
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

        // vytvor reset token
        AuthToken token = authTokenService.createToken(user, TokenType.PASSWORD_RESET, 1);

        // link do e-mailu
        String link = "http://localhost:5173/reset-password?token=" + token.getToken();

        // pošli e-mail
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
}
