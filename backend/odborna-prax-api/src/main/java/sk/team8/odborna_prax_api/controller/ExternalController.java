package sk.team8.odborna_prax_api.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sk.team8.odborna_prax_api.Entity.*;
import sk.team8.odborna_prax_api.dao.InternshipRepository;
import sk.team8.odborna_prax_api.dao.InternshipStateChangeRepository;
import sk.team8.odborna_prax_api.dao.InternshipStateRepository;
import sk.team8.odborna_prax_api.dao.UserRepository;
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
    private final UserRepository userRepository;

    @GetMapping("/internships")
    public ResponseEntity<?> getApprovedInternships(
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        if (!isValidAccessToken(authHeader)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid or missing access token"));
        }

        List<Internship> internships = internshipRepository.findAll();

        List<Map<String, Object>> result = new ArrayList<>();

        for (Internship internship : internships) {

            Optional<InternshipStateChange> lastOpt =
                    internshipStateChangeService.findLatestByInternshipId(internship.getId());

            if (lastOpt.isEmpty()) continue;

            InternshipStateChange last = lastOpt.get();

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
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @PathVariable("id") Integer internshipId,
            @PathVariable("newStatus") String newStatus
    ) {
        System.out.println("ENTERED updateInternshipStatus");

        if (!isValidAccessToken(authHeader)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid or missing access token"));
        }

        Optional<Internship> internshipOpt = internshipRepository.findById(internshipId);
        if (internshipOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Internship not found"));
        }
        Internship internship = internshipOpt.get();

        Optional<InternshipStateChange> lastOpt =
                internshipStateChangeService.findLatestByInternshipId(internshipId);
        if (lastOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "No state found for internship"));
        }
        InternshipStateChange last = lastOpt.get();

        if (!"APPROVED".equalsIgnoreCase(last.getInternshipState().getName())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Only APPROVED internships can be updated"));
        }

        String targetStateName = newStatus.toUpperCase(Locale.ROOT);
        if (!Set.of("PASSED", "FAILED").contains(targetStateName)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Invalid status. Must be PASSED or FAILED"));
        }

        InternshipState targetState = stateRepository.findByName(targetStateName)
                .orElseThrow(() -> new RuntimeException("State " + targetStateName + " not found"));

        InternshipStateChange change = new InternshipStateChange();
        change.setInternship(internship);
        change.setInternshipState(targetState);

        User systemUser = userRepository.findByEmail("external@system.local")
                .orElseThrow(() -> new RuntimeException("System user not found"));

        change.setUser(systemUser);
        change.setStateChangedAt(new java.sql.Timestamp(System.currentTimeMillis()));

        internshipStateChangeRepository.save(change);

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

