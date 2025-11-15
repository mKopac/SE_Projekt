package sk.team8.odborna_prax_api.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sk.team8.odborna_prax_api.Entity.User;
import sk.team8.odborna_prax_api.service.AdminUserService;
import sk.team8.odborna_prax_api.service.AuthService;

import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final AdminUserService adminUserService;
    private final AuthService authService;

    private boolean isAdmin(String token) {
        String email = authService.extractEmailFromToken(token);
        User user = authService.findUserByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getRole().getName().equalsIgnoreCase("ADMIN");
    }

    @GetMapping
    public ResponseEntity<?> getAllUsers(@RequestHeader("Authorization") String authHeader) {

        if (!authHeader.startsWith("Bearer "))
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        String token = authHeader.substring(7);

        if (!isAdmin(token))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Access denied"));

        return ResponseEntity.ok(adminUserService.getAllUsers());
    }

    @PostMapping("/{id}/suspend")
    public ResponseEntity<?> suspendUser(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable int id) {

        if (!authHeader.startsWith("Bearer "))
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        String token = authHeader.substring(7);

        if (!isAdmin(token))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();

        adminUserService.suspendUser(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/reactivate")
    public ResponseEntity<?> reactivateUser(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable int id) {

        if (!authHeader.startsWith("Bearer "))
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        String token = authHeader.substring(7);

        if (!isAdmin(token))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();

        adminUserService.reactivateUser(id);
        return ResponseEntity.ok().build();
    }
}
