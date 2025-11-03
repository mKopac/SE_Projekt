package sk.team8.odborna_prax_api.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import sk.team8.odborna_prax_api.Entity.User;
import sk.team8.odborna_prax_api.service.UserService;

import java.util.HashMap;
import java.util.Map;

import static java.util.Map.entry;

@RestController
@RequestMapping("/account")
public class AccountController {

    private final UserService userService;

    public AccountController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        try {
            String email = authentication.getName();
            User user = userService.findByEmail(email);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found"));
            }

            Map<String, Object> response = new HashMap<>();
            response.put("firstName", user.getFirstName());
            response.put("lastName", user.getLastName());
            response.put("email", user.getEmail());
            response.put("emailAlternate", user.getEmailAlternate());
            response.put("phoneNumber", user.getPhoneNumber());
            response.put("address", user.getAddress() != null ? user.getAddress().getStreet() : null);
            response.put("city", user.getAddress() != null ? user.getAddress().getCity() : null);
            response.put("zip", user.getAddress() != null ? user.getAddress().getZip() : null);
            response.put("role", user.getRole() != null ? user.getRole().getName() : null);
            response.put("studyProgram", user.getFieldOfStudy() != null ? user.getFieldOfStudy().getName() : null);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Chyba pri načítavaní profilu"));
        }
    }

    @PutMapping("/update")
    public ResponseEntity<?> updateUser(Authentication authentication, @RequestBody Map<String, Object> updates) {
        try {
            String email = authentication.getName();
            userService.updateUser(email, updates);
            return ResponseEntity.ok(Map.of("message", "Údaje boli úspešne aktualizované"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Chyba pri aktualizácii profilu"));
        }
    }
}
