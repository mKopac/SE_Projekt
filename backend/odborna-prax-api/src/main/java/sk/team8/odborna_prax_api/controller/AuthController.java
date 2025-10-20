package sk.team8.odborna_prax_api.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sk.team8.odborna_prax_api.dto.AdminRegisterRequest;
import sk.team8.odborna_prax_api.service.AdminRegistrationService;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AdminRegistrationService adminRegistrationService;

    public AuthController(AdminRegistrationService adminRegistrationService) {
        this.adminRegistrationService = adminRegistrationService;
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
}
