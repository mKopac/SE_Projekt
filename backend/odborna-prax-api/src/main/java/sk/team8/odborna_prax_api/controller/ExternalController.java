package sk.team8.odborna_prax_api.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sk.team8.odborna_prax_api.Entity.Internship;
import sk.team8.odborna_prax_api.Entity.InternshipState;
import sk.team8.odborna_prax_api.Entity.InternshipStateChange;
import sk.team8.odborna_prax_api.Entity.TokenType;
import sk.team8.odborna_prax_api.dao.InternshipRepository;
import sk.team8.odborna_prax_api.dao.InternshipStateChangeRepository;
import sk.team8.odborna_prax_api.dao.InternshipStateRepository;
import sk.team8.odborna_prax_api.service.AuthTokenService;
import sk.team8.odborna_prax_api.service.InternshipStateChangeService;
import sk.team8.odborna_prax_api.service.InternshipStateService;

import java.util.*;

@RestController
@RequestMapping("/external")
@RequiredArgsConstructor
public class ExternalController {

    private final InternshipRepository internshipRepository;
    private final InternshipStateRepository stateRepository;
    private final InternshipStateChangeRepository internshipStateChangeRepository;
    private final InternshipStateChangeService internshipStateChangeService;
    private final AuthTokenService authTokenService;

    @GetMapping("/internships")
    public ResponseEntity<?> getApprovedInternships() {
    /*
        // 1. Validácia ACCESS tokenu
        if (!isValidAccessToken(authHeader)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    */

        // 2. Načítanie všetkých praxí
        List<Internship> internships = internshipRepository.findAll();

        List<Map<String, Object>> result = new ArrayList<>();

        for (Internship internship : internships) {

            Optional<InternshipStateChange> lastOpt =
                    internshipStateChangeService.findLatestByInternshipId(internship.getId());

            if (lastOpt.isEmpty()) continue;

            InternshipStateChange last = lastOpt.get();

            // 3. Filter – iba APPROVED
            if (!"APPROVED".equals(last.getInternshipState().getName())) {
                continue;
            }

            Map<String, Object> map = new HashMap<>();
            map.put("internship", new DashboardController.InternshipDTO(internship, "APPROVED"));
            map.put("last_state", last);

            result.add(map);
        }

        return ResponseEntity.ok(result);
    }

    @PostMapping("/internships/{id}/{newStatus}")
    public ResponseEntity<?> updateInternshipStatus(
            @PathVariable("id") Integer internshipId,
            @PathVariable("newStatus") String newStatus
    ) {
        System.out.println("ENTERED updateInternshipStatus");

        // TEMP: token validation zatiaľ vynechaná
        // if (!isValidAccessToken(authHeader)) { ... }

        // 1. Načítať prax podľa ID
        Optional<Internship> internshipOpt = internshipRepository.findById(internshipId);
        if (internshipOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Internship not found"));
        }
        Internship internship = internshipOpt.get();

        // 2. Načítať posledný stav
        Optional<InternshipStateChange> lastOpt =
                internshipStateChangeService.findLatestByInternshipId(internshipId);
        if (lastOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "No state found for internship"));
        }
        InternshipStateChange last = lastOpt.get();

        // 3. Overiť, že posledný stav je APPROVED (len z APPROVED sa môže ísť na PASSED/FAILED)
        if (!"APPROVED".equalsIgnoreCase(last.getInternshipState().getName())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Only APPROVED internships can be updated"));
        }

        // 4. Overiť nový stav
        String targetStateName = newStatus.toUpperCase(Locale.ROOT);
        if (!Set.of("PASSED", "FAILED").contains(targetStateName)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Invalid status. Must be PASSED or FAILED"));
        }

        // 5. Načítať stav z repository (využívame stateRepository ako v DashboardController)
        InternshipState targetState = stateRepository.findByName(targetStateName)
                .orElseThrow(() -> new RuntimeException("State " + targetStateName + " not found"));

        // 6. Vytvoriť zmenu stavu (user môže byť null pre externý systém)
        InternshipStateChange change = new InternshipStateChange();
        change.setInternship(internship);
        change.setInternshipState(targetState);
        change.setUser(null); // externý systém nemá user
        change.setStateChangedAt(new java.sql.Timestamp(System.currentTimeMillis()));
        internshipStateChangeRepository.save(change);

        // 7. Response
        return ResponseEntity.ok(Map.of(
                "internshipId", internship.getId(),
                "newStatus", change.getInternshipState().getName()
        ));
    }

    private boolean isValidAccessToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return false;
        }

        String tokenValue = authHeader.substring(7);

        return authTokenService
                .validateToken(tokenValue, TokenType.ACCESS)
                .isPresent();
    }

}

