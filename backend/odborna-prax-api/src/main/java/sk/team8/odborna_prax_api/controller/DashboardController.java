package sk.team8.odborna_prax_api.controller;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.transaction.Transactional;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sk.team8.odborna_prax_api.Entity.*;
import sk.team8.odborna_prax_api.dao.*;
import sk.team8.odborna_prax_api.dto.CreateInternshipRequest;
import sk.team8.odborna_prax_api.service.AuthService;
import sk.team8.odborna_prax_api.service.EmailService;


import java.io.IOException;
import java.io.PrintWriter;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.sql.Timestamp;
import java.util.*;

@RestController
@RequestMapping("/dashboard")
public class DashboardController {

    private final AuthService authService;
    private final InternshipRepository internshipRepository;
    private final EmailService emailService;
    private final InternshipStateChangeRepository stateChangeRepository;
    private final InternshipStateRepository stateRepository;
    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final DocumentsRepository documentsRepository;
    private final TimestatementStateChangeRepository timestatementStateChangeRepository;
    private final TimestatementStateRepository timestatementStateRepository;


    public DashboardController(
            AuthService authService,
            InternshipRepository internshipRepository, EmailService emailService,
            InternshipStateChangeRepository stateChangeRepository,
            InternshipStateRepository stateRepository,
            UserRepository userRepository,
            CompanyRepository companyRepository,
            DocumentsRepository documentsRepository,
            TimestatementStateChangeRepository timestatementStateChangeRepository,
            TimestatementStateRepository timestatementStateRepository
    ) {
        this.authService = authService;
        this.internshipRepository = internshipRepository;
        this.emailService = emailService;
        this.stateChangeRepository = stateChangeRepository;
        this.stateRepository = stateRepository;
        this.userRepository = userRepository;
        this.companyRepository = companyRepository;
        this.documentsRepository = documentsRepository;
        this.timestatementStateChangeRepository = timestatementStateChangeRepository;
        this.timestatementStateRepository = timestatementStateRepository;
    }



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



    public static class InternshipDTO {
        public int id;
        public int studentId;
        public int companyId;
        public Integer mentorId;
        public String academicYear;
        public int semester;
        public String dateStart;
        public String dateEnd;
        public String status;
        public String description;

        public InternshipDTO(Internship i, String status) {
            this.id = i.getId();
            this.studentId = i.getStudent().getId();
            this.companyId = i.getCompany().getId();
            this.mentorId = i.getMentor() != null ? i.getMentor().getId() : null;
            this.academicYear = i.getAcademicYear();
            this.semester = i.getSemester();
            this.dateStart = i.getDateStart() != null ? i.getDateStart().toString() : null;
            this.dateEnd = i.getDateEnd() != null ? i.getDateEnd().toString() : null;
            this.status = status;
            this.description = i.getDescription();
        }
    }

    // ============================================================
    // GET /dashboard/internships
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
            return unauthorized();
        }

        User user = getUser(authHeader);
        String role = user.getRole().getName().toUpperCase(Locale.ROOT);

        Integer userStudentId = null;
        Integer userCompanyId = null;

        switch (role) {
            case "STUDENT" -> userStudentId = user.getId();
            case "COMPANY" -> {
                if (user.getCompany() == null)
                    return badRequest("Firma nebola nájdená.");
                userCompanyId = user.getCompany().getId();
            }
            case "ADMIN" -> {}
            default -> {
                return forbidden("Neoprávnená rola");
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

        if (userStudentId != null) {
            final Integer finalUserStudentId = userStudentId;
            internships.removeIf(i -> i.getStudent().getId() != finalUserStudentId);
        }


        List<Map<String, Object>> result = new ArrayList<>();

        for (Internship i : internships) {
            Optional<InternshipStateChange> lastOpt =
                    stateChangeRepository.findTopByInternshipIdOrderByStateChangedAtDesc(i.getId());

            InternshipStateChange last = lastOpt.orElse(null);
            String status = last != null
                    ? last.getInternshipState().getName()
                    : "UNKNOWN";

            Map<String, Object> map = new HashMap<>();
            map.put("internship", new InternshipDTO(i, status));
            map.put("last_state", last);
            result.add(map);
        }

        return ResponseEntity.ok(result);
    }



    @GetMapping("/students")
    public ResponseEntity<?> getStudents(@RequestHeader("Authorization") String authHeader) {
        if (!isValidToken(authHeader)) return unauthorized();
        List<User> students = userRepository.findByRoleName("STUDENT");
        return ResponseEntity.ok(students);
    }

    @GetMapping("/mentors")
    public ResponseEntity<?> getMentors(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(required = false) Integer companyId
    ) {
        if (!isValidToken(authHeader)) return unauthorized();

        if (companyId != null) {
            List<User> mentors = userRepository.findByCompanyId(companyId);
            return ResponseEntity.ok(mentors);
        }

        List<User> mentors = userRepository.findByRoleName("COMPANY");
        return ResponseEntity.ok(mentors);
    }


    @GetMapping("/companies")
    public ResponseEntity<?> getCompanies(@RequestHeader("Authorization") String authHeader) {
        if (!isValidToken(authHeader)) return unauthorized();
        List<Company> companies = companyRepository.findAll();
        return ResponseEntity.ok(companies);
    }



    @PostMapping("/internship")
    @Transactional
    public ResponseEntity<?> createInternship(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody CreateInternshipRequest request
    ) {
        if (!isValidToken(authHeader)) {
            return unauthorized();
        }

        User student = getUser(authHeader);

        try {
            Company company = companyRepository.findById(request.companyId)
                    .orElseThrow(() -> new RuntimeException("Company not found"));

            User mentor = null;
            if (request.mentorId != null) {
                mentor = userRepository.findById(request.mentorId)
                        .orElseThrow(() -> new RuntimeException("Mentor not found"));
            }

            Timestamp now = new Timestamp(System.currentTimeMillis());

            Internship internship = new Internship();
            internship.setStudent(student);
            internship.setCompany(company);
            internship.setMentor(mentor);
            internship.setAcademicYear(request.academicYear);
            internship.setSemester(request.semester);
            internship.setDateStart(request.dateStart);
            internship.setDateEnd(request.dateEnd);
            internship.setDescription(request.description);
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

            User mentorUser = internship.getMentor();
            if (mentorUser != null) {
                String subject = "Nová prax študenta " +
                        student.getFirstName() + " " + student.getLastName();
                String body =
                        "Dobrý deň,\n\n" +
                                "študent " + student.getFirstName() + " " + student.getLastName() +
                                " si vytvoril prax vo firme " + company.getName() + ".\n" +
                                "Prosím prihláste sa do systému a prax potvrďte alebo zamietnite.\n\n" +
                                "S pozdravom\n" +
                                "Systém odbornej praxe";

                emailService.sendEmail(
                        mentorUser.getEmail(),
                        subject,
                        body
                );
            }
            return ResponseEntity.ok(Map.of(
                    "message", "Internship created",
                    "internshipId", internship.getId()
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Server error", "details", e.getMessage()));
        }
    }

    // ============================================================
    // EXPORT CSV
    // ============================================================

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

        User user = getUser(authHeader);

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
        writer.println("Student,Firma,Mentor,Akademicky rok,Semester,Zaciatok praxe,Koniec praxe,Popis");

        for (Internship i : data) {
            String studentName = i.getStudent().getFirstName() + " " + i.getStudent().getLastName();
            String mentorName = i.getMentor() != null
                    ? i.getMentor().getFirstName() + " " + i.getMentor().getLastName()
                    : "";
            String companyName = i.getCompany().getName();

            writer.printf("%s,%s,%s,%s,%d,%s,%s,%s%n",
                    studentName,
                    companyName,
                    mentorName,
                    i.getAcademicYear(),
                    i.getSemester(),
                    i.getDateStart().toString(),
                    i.getDateEnd().toString(),
                    i.getDescription() != null ? i.getDescription() : ""
            );
        }

        writer.flush();
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

        User student = internship.getStudent();

        if ("ACCEPT".equalsIgnoreCase(decision)) {
            // === mentor POTVRDIL prax ===
            String subjectStudent = "Vaša prax bola potvrdená mentorom";
            String bodyStudent =
                    "Dobrý deň,\n\n" +
                            "vaša prax vo firme " + internship.getCompany().getName() +
                            " bola potvrdená mentorom.\n\n" +
                            "S pozdravom\n" +
                            "Systém odbornej praxe";

            emailService.sendEmail(
                    student.getEmail(),
                    subjectStudent,
                    bodyStudent
            );



        } else if ("REJECT".equalsIgnoreCase(decision)) {
            // === mentor ZAMIETOL prax ===
            String subjectStudent = "Vaša prax bola zamietnutá mentorom";
            String bodyStudent =
                    "Dobrý deň,\n\n" +
                            "vaša prax vo firme " + internship.getCompany().getName() +
                            " bola zamietnutá mentorom.\n\n" +
                            "S pozdravom\n" +
                            "Systém odbornej praxe";

            emailService.sendEmail(
                    student.getEmail(),
                    subjectStudent,
                    bodyStudent
            );
        }
        stateChangeRepository.save(change);

        return ResponseEntity.ok(Map.of("internshipId", id, "newState", targetName));
    }

    // ============================================================
    // ADMIN – CHANGE STATE
    // ============================================================

    @PostMapping("/internship/{id}/admin-state")
    @Transactional
    public ResponseEntity<?> adminChangeState(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable int id,
            @RequestParam("state") String state
    ) {
        if (!isValidToken(authHeader)) return unauthorized();

        User user = getUser(authHeader);

        if (!"ADMIN".equalsIgnoreCase(user.getRole().getName())) {
            return forbidden("Only admin can change internship state");
        }

        Internship internship = internshipRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Internship not found"));

        Optional<InternshipStateChange> lastOpt =
                stateChangeRepository.findTopByInternshipIdOrderByStateChangedAtDesc(id);

        if (lastOpt.isEmpty()) {
            return badRequest("Internship has no state yet");
        }

        String lastName = lastOpt.get().getInternshipState().getName().toUpperCase(Locale.ROOT);
        String targetName = state.toUpperCase(Locale.ROOT);


        if (Set.of("DENIED", "PASSED", "FAILED").contains(lastName)) {
            return badRequest("This internship state cannot be changed anymore");
        }


        if ("CREATED".equals(lastName)) {
            if (!Set.of("APPROVED", "DENIED").contains(targetName)) {
                return badRequest("From CREATED you can set only APPROVED or DENIED");
            }
        }

        if ("ACCEPTED".equals(lastName)) {
            if (!Set.of("APPROVED", "DENIED").contains(targetName)) {
                return badRequest("From ACCEPTED you can set only APPROVED or DENIED");
            }
        }

        if ("APPROVED".equals(lastName)) {
            if (!Set.of("PASSED", "FAILED").contains(targetName)) {
                return badRequest("From APPROVED you can set only PASSED or FAILED");
            }


            boolean hasContract = documentsRepository
                    .existsByInternshipIdAndDocumentType_Name(id, "CONTRACT");

            if (!hasContract) {
                return badRequest("Contract is required before setting PASSED/FAILED");
            }
        }


        Set<String> knownStates = Set.of("CREATED", "ACCEPTED", "APPROVED", "DENIED", "PASSED", "FAILED");
        if (!knownStates.contains(lastName)) {
            return badRequest("Unsupported current state: " + lastName);
        }

        // safety check - unknown target state
        Set<String> allowedTargets = Set.of("APPROVED", "DENIED", "PASSED", "FAILED");
        if (!allowedTargets.contains(targetName)) {
            return badRequest("Unsupported target state: " + targetName);
        }

        InternshipState targetState = stateRepository.findByName(targetName)
                .orElseThrow(() -> new RuntimeException("State " + targetName + " not found"));

        InternshipStateChange change = addStateChange(internship, targetState, user);

        User student = internship.getStudent();
        User mentor = internship.getMentor();

        String humanReadable;
        switch (targetName) {
            case "APPROVED" -> humanReadable = "schválená";
            case "DENIED" -> humanReadable = "zamietnutá";
            case "PASSED" -> humanReadable = "úspešne absolvovaná";
            case "FAILED" -> humanReadable = "neúspešne absolvovaná";
            default -> humanReadable = targetName;
        }

        String subject = "Zmena stavu vašej praxe";
        String body =
                "Dobrý deň,\n\n" +
                        "prax vo firme " + internship.getCompany().getName() +
                        " bola administrátorom označená ako: " + humanReadable + ".\n\n" +
                        "S pozdravom\n" +
                        "Systém odbornej praxe";

        // študent
        emailService.sendEmail(student.getEmail(), subject, body);

        // mentor (ak existuje)
        if (mentor != null) {
            emailService.sendEmail(mentor.getEmail(), subject, body);
        }

        return ResponseEntity.ok(Map.of(
                "internshipId", internship.getId(),
                "newState", change.getInternshipState().getName()
        ));
    }





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


    @GetMapping("/internships/{id}/documents")
    public ResponseEntity<?> getDocumentsForInternship(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable int id
    ) {
        if (!authService.isTokenValid(authHeader.substring(7))) {
            return ResponseEntity.status(401).body("Invalid token");
        }

        List<Documents> docs = documentsRepository.findByInternshipId(id);

        List<Map<String, Object>> response = new ArrayList<>();

        for (Documents d : docs) {

            String documentType = d.getDocumentType().getName();

            TimestatementStateChange lastState =
                    timestatementStateChangeRepository
                            .findTopByDocumentIdOrderByStateChangedAtDesc(d.getId())
                            .orElse(null);

            String stateName = (lastState != null)
                    ? lastState.getTimestatementState().getName()
                    : "UNKNOWN";

            Map<String, Object> item = new HashMap<>();
            item.put("documentId", d.getId());
            item.put("fileName", d.getDocumentName());
            item.put("documentType", documentType);
            item.put("currentState", stateName);
            item.put("type", documentType);

            response.add(item);
        }


        return ResponseEntity.ok(response);
    }


}
