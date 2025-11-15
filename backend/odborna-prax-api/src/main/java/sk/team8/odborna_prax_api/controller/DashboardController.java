package sk.team8.odborna_prax_api.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sk.team8.odborna_prax_api.Entity.Company;
import sk.team8.odborna_prax_api.Entity.Internship;
import sk.team8.odborna_prax_api.Entity.InternshipStateChange;
import sk.team8.odborna_prax_api.Entity.User;
import sk.team8.odborna_prax_api.dao.CompanyRepository;
import sk.team8.odborna_prax_api.dao.InternshipRepository;
import sk.team8.odborna_prax_api.dao.InternshipStateChangeRepository;
import sk.team8.odborna_prax_api.dao.UserRepository;
import sk.team8.odborna_prax_api.service.AuthService;

import java.util.*;

@RestController
@RequestMapping("/dashboard")
public class DashboardController {

    private final AuthService authService;
    private final InternshipRepository internshipRepository;
    private final InternshipStateChangeRepository stateChangeRepository;
    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;

    public DashboardController(AuthService authService,
                               InternshipRepository internshipRepository,
                               InternshipStateChangeRepository stateChangeRepository,
                               UserRepository userRepository,
                               CompanyRepository companyRepository) {

        this.authService = authService;
        this.internshipRepository = internshipRepository;
        this.stateChangeRepository = stateChangeRepository;
        this.userRepository = userRepository;
        this.companyRepository = companyRepository;
    }

    // ============================================================
    // Token validation helper
    // ============================================================
    private boolean isValidToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return false;
        return authService.isTokenValid(authHeader.substring(7));
    }

    private String extractEmail(String authHeader) {
        return authService.extractEmailFromToken(authHeader.substring(7));
    }

    // ============================================================
    // INTERNSHIP DTO FOR FRONTEND
    // ============================================================
    public static class InternshipDTO {

        private int id;
        private int studentId;
        private int companyId;
        private Integer mentorId;
        private String academicYear;
        private int semester;
        private String dateStart;
        private String dateEnd;

        public InternshipDTO(int id, int studentId, int companyId, Integer mentorId,
                             String academicYear, int semester,
                             String dateStart, String dateEnd) {

            this.id = id;
            this.studentId = studentId;
            this.companyId = companyId;
            this.mentorId = mentorId;
            this.academicYear = academicYear;
            this.semester = semester;
            this.dateStart = dateStart;
            this.dateEnd = dateEnd;
        }

        public int getId() { return id; }
        public int getStudentId() { return studentId; }
        public int getCompanyId() { return companyId; }
        public Integer getMentorId() { return mentorId; }
        public String getAcademicYear() { return academicYear; }
        public int getSemester() { return semester; }
        public String getDateStart() { return dateStart; }
        public String getDateEnd() { return dateEnd; }
    }

    // ============================================================
    // GET INTERNSHIPS BASED ON LOGGED USER ROLE
    // ============================================================
    @GetMapping("/internships")
    public ResponseEntity<?> getInternships(@RequestHeader("Authorization") String authHeader) {

        if (!isValidToken(authHeader)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid or expired token"));
        }

        String email = extractEmail(authHeader);

        User user = authService.findUserByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Používateľ neexistuje."));

        String role = user.getRole().getName().toUpperCase();
        List<Internship> internships;

        switch (role) {

            case "STUDENT" -> internships =
                    internshipRepository.findByStudentId(user.getId());

            case "COMPANY" -> {
                if (user.getCompany() == null) {
                    return ResponseEntity.badRequest()
                            .body(Map.of("error", "Firma nebola nájdená."));
                }
                internships =
                        internshipRepository.findByCompanyId(user.getCompany().getId());
            }

            case "ADMIN" -> internships = internshipRepository.findAll();

            default -> {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Unauthorized role"));
            }
        }

        List<Map<String, Object>> result = internships.stream().map(i -> {

            Optional<InternshipStateChange> lastState =
                    stateChangeRepository.findTopByInternshipIdOrderByStateChangedAtDesc(i.getId());

            InternshipDTO dto = new InternshipDTO(
                    i.getId(),
                    i.getStudent().getId(),
                    i.getCompany().getId(),
                    i.getMentor() != null ? i.getMentor().getId() : null,
                    i.getAcademicYear(),
                    i.getSemester(),
                    i.getDateStart() != null ? i.getDateStart().toString() : null,
                    i.getDateEnd() != null ? i.getDateEnd().toString() : null
            );

            return Map.of(
                    "internship", dto,
                    "last_state", lastState.orElse(null)
            );

        }).toList();

        return ResponseEntity.ok(result);
    }

    // ============================================================
    // GET STUDENTS
    // ============================================================
    @GetMapping("/students")
    public ResponseEntity<?> getStudents(@RequestHeader("Authorization") String authHeader) {

        if (!isValidToken(authHeader)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid token"));
        }

        List<User> students =
                userRepository.findByRoleName("STUDENT");

        return ResponseEntity.ok(students);
    }

    // ============================================================
    // GET MENTORS (users with role COMPANY)
    // ============================================================
    @GetMapping("/mentors")
    public ResponseEntity<?> getMentors(@RequestHeader("Authorization") String authHeader) {

        if (!isValidToken(authHeader)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid token"));
        }

        // Mentor = employee of a company (role COMPANY)
        List<User> mentors =
                userRepository.findByRoleName("COMPANY");

        return ResponseEntity.ok(mentors);
    }

    // ============================================================
    // GET COMPANIES
    // ============================================================
    @GetMapping("/companies")
    public ResponseEntity<?> getCompanies(@RequestHeader("Authorization") String authHeader) {

        if (!isValidToken(authHeader)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid token"));
        }

        List<Company> companies = companyRepository.findAll();

        return ResponseEntity.ok(companies);
    }
}
