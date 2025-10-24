package sk.team8.odborna_prax_api.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sk.team8.odborna_prax_api.dto.AdminRegisterRequest;
import sk.team8.odborna_prax_api.dto.LoginRequest;
import sk.team8.odborna_prax_api.service.AdminRegistrationService;
import sk.team8.odborna_prax_api.service.AuthService;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AdminRegistrationService adminRegistrationService;
    private final AuthService authService;

    public AuthController(AdminRegistrationService adminRegistrationService, AuthService authService) {
        this.adminRegistrationService = adminRegistrationService;
        this.authService = authService;
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
}
