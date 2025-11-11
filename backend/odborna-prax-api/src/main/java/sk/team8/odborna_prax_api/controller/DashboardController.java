package sk.team8.odborna_prax_api.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sk.team8.odborna_prax_api.Entity.Internship;
import sk.team8.odborna_prax_api.Entity.InternshipStateChange;
import sk.team8.odborna_prax_api.Entity.User;
import sk.team8.odborna_prax_api.dao.InternshipRepository;
import sk.team8.odborna_prax_api.dao.InternshipStateChangeRepository;
import sk.team8.odborna_prax_api.service.AuthService;

import java.util.*;

@RestController
@RequestMapping("/dashboard")
public class DashboardController {

    private final AuthService authService;
    private final InternshipRepository internshipRepository;
    private final InternshipStateChangeRepository stateChangeRepository;

    public DashboardController(AuthService authService,
                               InternshipRepository internshipRepository,
                               InternshipStateChangeRepository stateChangeRepository) {
        this.authService = authService;
        this.internshipRepository = internshipRepository;
        this.stateChangeRepository = stateChangeRepository;
    }

    @GetMapping("/internships")
    public ResponseEntity<?> getInternships(@RequestHeader("Authorization") String authHeader) {

        // kontrola tokenu
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Missing or invalid Authorization header"));
        }

        String token = authHeader.substring(7);

        if (!authService.isTokenValid(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid or expired token"));
        }

        // získaj používateľa
        String email = authService.extractEmailFromToken(token);
        User user = authService.findUserByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Používateľ neexistuje."));

        String role = user.getRole().getName().toUpperCase();
        List<Internship> internships;

        // podľa role
        switch (role) {
            case "STUDENT" -> internships = internshipRepository.findByStudentId(user.getId());
            case "COMPANY" -> {
                if (user.getCompany() == null) {
                    return ResponseEntity.badRequest()
                            .body(Map.of("error", "Spoločnosť pre používateľa nebola nájdená."));
                }
                internships = internshipRepository.findByCompanyId(user.getCompany().getId());
            }
            case "ADMIN" -> internships = internshipRepository.findAll();
            default -> {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Unauthorized role"));
            }
        }

        // pre každú prax nájdi jej posledný stav
        List<Map<String, Object>> result = internships.stream().map(i -> {
            Optional<InternshipStateChange> lastStateOpt =
                    stateChangeRepository.findTopByInternshipIdOrderByStateChangedAtDesc(i.getId());

            return Map.of(
                    "internship", i,
                    "last_state", lastStateOpt.orElse(null)
            );
        }).toList();

        return ResponseEntity.ok(result);
    }
}
