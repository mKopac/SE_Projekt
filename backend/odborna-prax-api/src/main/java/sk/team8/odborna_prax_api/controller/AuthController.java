package sk.team8.odborna_prax_api.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sk.team8.odborna_prax_api.Entity.User;
import sk.team8.odborna_prax_api.dto.AdminRegisterRequest;
import sk.team8.odborna_prax_api.dto.ChangePasswordRequest;
import sk.team8.odborna_prax_api.dto.LoginRequest;
import sk.team8.odborna_prax_api.service.AdminRegistrationService;
import sk.team8.odborna_prax_api.service.AuthService;
import sk.team8.odborna_prax_api.service.PasswordChangeService;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AdminRegistrationService adminRegistrationService;
    private final AuthService authService;
    private final PasswordChangeService passwordChangeService;

    public AuthController(AdminRegistrationService adminRegistrationService, AuthService authService, PasswordChangeService passwordChangeService) {
        this.adminRegistrationService = adminRegistrationService;
        this.authService = authService;
        this.passwordChangeService = passwordChangeService;
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

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Missing or invalid Authorization header"));
        }

        String token = authHeader.substring(7);
        authService.logout(token);
        return ResponseEntity.ok(Map.of("message", "Successfully logged out"));
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

}
