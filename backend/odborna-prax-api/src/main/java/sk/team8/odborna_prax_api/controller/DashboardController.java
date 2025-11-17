package sk.team8.odborna_prax_api.controller;

import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sk.team8.odborna_prax_api.Entity.*;
import sk.team8.odborna_prax_api.dao.*;
import sk.team8.odborna_prax_api.dto.CreateInternshipRequest;
import sk.team8.odborna_prax_api.service.AuthService;

import java.sql.Timestamp;
import java.util.*;

@RestController
@RequestMapping("/dashboard")
public class DashboardController {

    private final AuthService authService;
    private final InternshipRepository internshipRepository;
    private final InternshipStateChangeRepository stateChangeRepository;
    private final InternshipStateRepository stateRepository;
    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;

    public DashboardController(
            AuthService authService,
            InternshipRepository internshipRepository,
            InternshipStateChangeRepository stateChangeRepository,
            InternshipStateRepository stateRepository,
            UserRepository userRepository,
            CompanyRepository companyRepository
    ) {
        this.authService = authService;
        this.internshipRepository = internshipRepository;
        this.stateChangeRepository = stateChangeRepository;
        this.stateRepository = stateRepository;
        this.userRepository = userRepository;
        this.companyRepository = companyRepository;
    }

    // ============================================================
    // Helpers
    // ============================================================

    private boolean isValidToken(String authHeader) {
        return authHeader != null && authHeader.startsWith("Bearer ")
                && authService.isTokenValid(authHeader.substring(7));
    }

    private String extractEmail(String authHeader) {
        return authService.extractEmailFromToken(authHeader.substring(7));
    }

    private User getUser(String authHeader) {
        String email = extractEmail(authHeader);
        return authService.findUserByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private ResponseEntity<?> unauthorized() {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Invalid or expired token"));
    }

    private ResponseEntity<?> forbidden(String msg) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", msg));
    }

    private ResponseEntity<?> badRequest(String msg) {
        return ResponseEntity.badRequest().body(Map.of("error", msg));
    }

    // ============================================================
    // DTO pre FE
    // ============================================================

    public static class InternshipDTO {
        public int id;
        public int studentId;
        public int companyId;
        public Integer mentorId;
        public String academicYear;
        public int semester;
        public String dateStart;
        public String dateEnd;

        public InternshipDTO(Internship i) {
            this.id = i.getId();
            this.studentId = i.getStudent().getId();
            this.companyId = i.getCompany().getId();
            this.mentorId = i.getMentor() != null ? i.getMentor().getId() : null;
            this.academicYear = i.getAcademicYear();
            this.semester = i.getSemester();
            this.dateStart = i.getDateStart() != null ? i.getDateStart().toString() : null;
            this.dateEnd = i.getDateEnd() != null ? i.getDateEnd().toString() : null;
        }
    }

    // ============================================================
    // GET /dashboard/internships
    // ============================================================

    @GetMapping("/internships")
    public ResponseEntity<?> getInternships(@RequestHeader("Authorization") String authHeader) {

        if (!isValidToken(authHeader)) return unauthorized();

        User user = getUser(authHeader);
        String role = user.getRole().getName().toUpperCase();

        List<Internship> internships;

        switch (role) {
            case "STUDENT" ->
                    internships = internshipRepository.findByStudentId(user.getId());

            case "COMPANY" -> {
                if (user.getCompany() == null)
                    return badRequest("User has no assigned company");
                internships =
                        internshipRepository.findByCompanyId(user.getCompany().getId());
            }

            case "ADMIN" ->
                    internships = internshipRepository.findAll();

            default ->
            { return forbidden("Unauthorized role"); }
        }

        List<Map<String, Object>> result = new ArrayList<>();

        for (Internship i : internships) {

            Optional<InternshipStateChange> last =
                    stateChangeRepository.findTopByInternshipIdOrderByStateChangedAtDesc(i.getId());

            result.add(Map.of(
                    "internship", new InternshipDTO(i),
                    "last_state", last.orElse(null)
            ));
        }

        return ResponseEntity.ok(result);
    }

    // ============================================================
    // POMOCNÉ ENDPOINTY PRE FRONTEND (študenti, mentori, firmy)
    // ============================================================

    @GetMapping("/students")
    public ResponseEntity<?> getStudents(@RequestHeader("Authorization") String authHeader) {
        if (!isValidToken(authHeader)) return unauthorized();
        List<User> students = userRepository.findByRoleName("STUDENT");
        return ResponseEntity.ok(students);
    }

    @GetMapping("/mentors")
    public ResponseEntity<?> getMentors(@RequestHeader("Authorization") String authHeader) {
        if (!isValidToken(authHeader)) return unauthorized();
        List<User> mentors = userRepository.findByRoleName("COMPANY");
        return ResponseEntity.ok(mentors);
    }

    @GetMapping("/companies")
    public ResponseEntity<?> getCompanies(@RequestHeader("Authorization") String authHeader) {
        if (!isValidToken(authHeader)) return unauthorized();
        List<Company> companies = companyRepository.findAll();
        return ResponseEntity.ok(companies);
    }

    // ============================================================
    // CREATE INTERNSHIP + STATE CREATED
    // ============================================================

    @PostMapping("/internship")
    @Transactional
    public ResponseEntity<?> createInternship(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody CreateInternshipRequest request
    ) {
        if (!isValidToken(authHeader)) return unauthorized();

        User student = getUser(authHeader);

        Company company = companyRepository.findById(request.companyId)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        User mentor = null;
        if (request.mentorId != null) {
            mentor = userRepository.findById(request.mentorId)
                    .orElseThrow(() -> new RuntimeException("Mentor not found"));
        }

        Internship internship = new Internship();
        internship.setStudent(student);
        internship.setCompany(company);
        internship.setMentor(mentor);
        internship.setAcademicYear(request.academicYear);
        internship.setSemester(request.semester);
        internship.setDateStart(request.dateStart);
        internship.setDateEnd(request.dateEnd);
        Timestamp now = new Timestamp(System.currentTimeMillis());
        internship.setCreatedAt(now);
        internship.setUpdatedAt(now);

        internshipRepository.save(internship);

        InternshipState created = stateRepository.findByName("CREATED")
                .orElseThrow(() -> new RuntimeException("State CREATED not found"));

        InternshipStateChange change = new InternshipStateChange(
                internship,
                created,
                student,
                now
        );

        stateChangeRepository.save(change);

        return ResponseEntity.ok(Map.of(
                "message", "Internship created",
                "internshipId", internship.getId()
        ));
    }

    // ============================================================
    // COMPANY DECISION (ACCEPT / REJECT)
    // ============================================================

    @PostMapping("/internship/{id}/company-decision")
    @Transactional
    public ResponseEntity<?> companyDecision(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable int id,
            @RequestParam("decision") String decision
    ) {

        if (!isValidToken(authHeader)) return unauthorized();

        User companyUser = getUser(authHeader);

        if (!companyUser.getRole().getName().equals("COMPANY"))
            return forbidden("Only company can perform this action");

        Internship internship = internshipRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Internship not found"));

        InternshipStateChange last =
                stateChangeRepository.findTopByInternshipIdOrderByStateChangedAtDesc(id)
                        .orElse(null);

        if (last == null || !last.getInternshipState().getName().equals("CREATED"))
            return badRequest("Company can change only CREATED internship");

        String targetName = decision.equalsIgnoreCase("ACCEPT") ? "ACCEPTED" : "REJECTED";

        InternshipState target = stateRepository.findByName(targetName)
                .orElseThrow(() -> new RuntimeException("State not found"));

        InternshipStateChange change = new InternshipStateChange(
                internship,
                target,
                companyUser,
                new Timestamp(System.currentTimeMillis())
        );

        stateChangeRepository.save(change);

        return ResponseEntity.ok(Map.of("internshipId", id, "newState", targetName));
    }

    // ============================================================
    // ADMIN – CHANGE STATE (možné opakovane po ACCEPTED, okrem REJECTED)
    // ============================================================

    @PostMapping("/internship/{id}/admin-state")
    @Transactional
    public ResponseEntity<?> adminChangeState(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable int id,
            @RequestParam("state") String state   // APPROVED, DENIED, PASSED, FAILED
    ) {
        if (!isValidToken(authHeader)) return unauthorized();

        User user = getUser(authHeader);

        if (!"ADMIN".equalsIgnoreCase(user.getRole().getName())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Only admin can change internship state"));
        }

        Internship internship = internshipRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Internship not found"));

        Optional<InternshipStateChange> lastOpt =
                stateChangeRepository.findTopByInternshipIdOrderByStateChangedAtDesc(id);

        if (lastOpt.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Internship has no state yet"));
        }

        String lastName = lastOpt.get().getInternshipState().getName().toUpperCase(Locale.ROOT);

        // REJECTED sa nikdy meniť nesmie
        if ("REJECTED".equals(lastName)) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Rejected internship state cannot be changed"));
        }

        // admin môže meniť stav, ak je po potvrdení firmou:
        // ACCEPTED alebo už niektorý z admin stavov (APPROVED, DENIED, PASSED, FAILED)
        Set<String> allowedCurrent = Set.of("ACCEPTED", "APPROVED", "DENIED", "PASSED", "FAILED");
        if (!allowedCurrent.contains(lastName)) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Admin can change state only after company ACCEPTED"));
        }

        String targetName = state.toUpperCase(Locale.ROOT);
        Set<String> allowedTarget = Set.of("APPROVED", "DENIED", "PASSED", "FAILED");
        if (!allowedTarget.contains(targetName)) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Unsupported state. Allowed: " + allowedTarget));
        }

        InternshipState targetState = stateRepository.findByName(targetName)
                .orElseThrow(() -> new RuntimeException("State " + targetName + " not found"));

        InternshipStateChange change = addStateChange(internship, targetState, user);

        return ResponseEntity.ok(Map.of(
                "internshipId", internship.getId(),
                "newState", change.getInternshipState().getName()
        ));
    }

    // ============================================================
    // Helper na zápis zmeny stavu
    // ============================================================

    private InternshipStateChange addStateChange(
            Internship internship,
            InternshipState state,
            User user
    ) {
        InternshipStateChange change = new InternshipStateChange();
        change.setInternship(internship);
        change.setInternshipState(state);
        change.setUser(user);
        change.setStateChangedAt(new Timestamp(System.currentTimeMillis()));
        return stateChangeRepository.save(change);
    }
}
