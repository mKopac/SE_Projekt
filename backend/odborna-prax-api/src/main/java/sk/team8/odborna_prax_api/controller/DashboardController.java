package sk.team8.odborna_prax_api.controller;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.transaction.Transactional;
import org.springframework.security.core.Authentication;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sk.team8.odborna_prax_api.Entity.*;
import sk.team8.odborna_prax_api.dao.*;
import sk.team8.odborna_prax_api.dto.CreateInternshipRequest;
import sk.team8.odborna_prax_api.service.AuthService;


import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Timestamp;
import java.util.*;

@RestController
@RequestMapping("/dashboard")
public class DashboardController {

    private final AuthService authService;
    private final InternshipRepository internshipRepository;
    private final InternshipStateChangeRepository stateChangeRepository;
    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final InternshipStateRepository internshipStateRepository;
    private final InternshipStateChangeRepository internshipStateChangeRepository;


    public DashboardController(AuthService authService,
                               InternshipRepository internshipRepository,
                               InternshipStateChangeRepository stateChangeRepository,
                               UserRepository userRepository,
                               CompanyRepository companyRepository, InternshipStateRepository internshipStateRepository, InternshipStateChangeRepository internshipStateChangeRepository) {

        this.authService = authService;
        this.internshipRepository = internshipRepository;
        this.stateChangeRepository = stateChangeRepository;
        this.userRepository = userRepository;
        this.companyRepository = companyRepository;
        this.internshipStateRepository = internshipStateRepository;
        this.internshipStateChangeRepository = internshipStateChangeRepository;
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
    public ResponseEntity<?> getInternships(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(required = false) Integer companyId,
            @RequestParam(required = false) Integer mentorId,
            @RequestParam(required = false) String academicYear,
            @RequestParam(required = false) Integer semester,
            @RequestParam(required = false) String search
    ) {

        if (!isValidToken(authHeader)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid or expired token"));
        }

        String email = extractEmail(authHeader);
        User user = authService.findUserByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Používateľ neexistuje."));

        String role = user.getRole().getName().toUpperCase();

        Integer userStudentId = null;
        Integer userCompanyId = null;

        switch (role) {
            case "STUDENT" -> userStudentId = user.getId();
            case "COMPANY" -> {
                if (user.getCompany() == null)
                    return ResponseEntity.badRequest().body(Map.of("error", "Firma nebola nájdená."));
                userCompanyId = user.getCompany().getId();
            }
            case "ADMIN" -> {}
            default -> {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Neoprávnená rola"));
            }
        }

        List<Internship> internships =
                internshipRepository.filterInternships(
                        userCompanyId != null ? userCompanyId : companyId,
                        mentorId,
                        academicYear,
                        semester,
                        (search != null && !search.isBlank()) ? search : null
                );

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

    @PostMapping("/internship")
    @Transactional
    public ResponseEntity<?> createInternship(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody CreateInternshipRequest request
    ) {
        try {
            if (!isValidToken(authHeader)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Invalid or expired token"));
            }

            String email = extractEmail(authHeader);
            User student = authService.findUserByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Logged-in user not found"));

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
            internship.setCreatedAt(new Timestamp(System.currentTimeMillis()));
            internship.setUpdatedAt(new Timestamp(System.currentTimeMillis()));

            internshipRepository.save(internship);

            InternshipState createdState = internshipStateRepository.findById(1)
                    .orElseThrow(() -> new RuntimeException("State ID 1 (CREATED) not found"));

            InternshipStateChange change = new InternshipStateChange(
                    internship,
                    createdState,
                    student,
                    new Timestamp(System.currentTimeMillis())
            );

            internshipStateChangeRepository.save(change);

            return ResponseEntity.ok(Map.of(
                    "message", "Internship created successfully",
                    "internshipId", internship.getId()
            ));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Server error", "details", e.getMessage()));
        }
    }

    @GetMapping("/internships/export")
    public void exportInternshipsCsv(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(required = false) Integer companyId,
            @RequestParam(required = false) Integer mentorId,
            @RequestParam(required = false) String academicYear,
            @RequestParam(required = false) Integer semester,
            @RequestParam(required = false) String search,
            HttpServletResponse response
    ) throws IOException {

        if (!isValidToken(authHeader)) {
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            return;
        }

        String email = extractEmail(authHeader);
        User user = authService.findUserByEmail(email)
                .orElseThrow();

        if (!user.getRole().getName().equalsIgnoreCase("ADMIN")) {
            response.setStatus(HttpStatus.FORBIDDEN.value());
            return;
        }

        List<Internship> data = internshipRepository.filterInternships(
                companyId, mentorId, academicYear, semester,
                (search != null && !search.isBlank()) ? search : null
        );

        response.setContentType("text/csv");
        response.setHeader("Content-Disposition", "attachment; filename=internships_export.csv");

        PrintWriter writer = response.getWriter();
        writer.println("Student,Firma,Mentor,Akademicky rok,Semester,Zaciatok praxe,Koniec praxe");

        for (Internship i : data) {
            String studentName = i.getStudent().getFirstName() + " " + i.getStudent().getLastName();
            String mentorName = i.getMentor() != null
                    ? i.getMentor().getFirstName() + " " + i.getMentor().getLastName()
                    : "";
            String companyName = i.getCompany().getName();

            writer.printf("%s,%s,%s,%s,%d,%s,%s%n",
                    studentName,
                    companyName,
                    mentorName,
                    i.getAcademicYear(),
                    i.getSemester(),
                    i.getDateStart().toString(),
                    i.getDateEnd().toString()
            );
        }

        writer.flush();
    }


}
