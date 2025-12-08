package sk.team8.odborna_prax_api.controller;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.core.io.Resource;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import sk.team8.odborna_prax_api.Entity.Documents;
import sk.team8.odborna_prax_api.Entity.TimestatementState;
import sk.team8.odborna_prax_api.Entity.TimestatementStateChange;
import sk.team8.odborna_prax_api.Entity.User;
import sk.team8.odborna_prax_api.dto.DocumentDownloadResponse;
import sk.team8.odborna_prax_api.service.DocumentsService;
import sk.team8.odborna_prax_api.dao.DocumentsRepository;
import sk.team8.odborna_prax_api.dao.TimestatementStateRepository;
import sk.team8.odborna_prax_api.dao.TimestatementStateChangeRepository;
import sk.team8.odborna_prax_api.dao.UserRepository;

import java.security.Principal;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.sql.Timestamp;




@RestController
@RequestMapping("/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentsService documentsService;
    private final UserRepository userRepository;
    private final DocumentsRepository documentsRepository;
    private final TimestatementStateRepository timestatementStateRepository;
    private final TimestatementStateChangeRepository timestatementStateChangeRepository;

    @PostMapping("/upload/timestatement")
    public ResponseEntity<?> uploadTimestatement(
            @RequestParam Integer internshipId,
            @RequestPart("file") MultipartFile file,
            Principal principal
    ) {
        documentsService.uploadTimestatement(internshipId, file, principal.getName());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/contracts/template")
    public ResponseEntity<Resource> downloadContractTemplate() {
        try {

            Resource resource = new ClassPathResource("documents/Ziadost_o_prax.docx");

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(
                            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"))

                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"Ziadost_o_prax.docx\"")
                    .body(resource);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/upload/contract")
    public ResponseEntity<?> uploadContract(
            @RequestParam Integer internshipId,
            @RequestPart("file") MultipartFile file,
            Principal principal
    ) {
        documentsService.uploadContract(internshipId, file, principal.getName());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> download(@PathVariable Integer id) {

        DocumentDownloadResponse response = documentsService.downloadDocument(id);

        // zisti content-type
        String contentType = "application/octet-stream";
        if (response.getFileName().endsWith(".pdf")) {
            contentType = "application/pdf";
        } else if (response.getFileName().endsWith(".docx")) {
            contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        } else if (response.getFileName().endsWith(".doc")) {
            contentType = "application/msword";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + response.getFileName() + "\""
                )
                .body(response.getResource());
    }

    @PostMapping("/{id}/company-decision")
    @Transactional
    public ResponseEntity<?> companyDocumentDecision(
            @PathVariable int id,
            @RequestParam("state") String state,
            Principal principal
    ) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!"COMPANY".equalsIgnoreCase(user.getRole().getName())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Only company can change document state"));
        }

        Documents doc = documentsRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        // skontroluje ze ci dokument patri tej firme
        if (doc.getInternship() == null
                || doc.getInternship().getCompany() == null
                || !Objects.equals(doc.getInternship().getCompany().getId(), user.getCompany().getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Document does not belong to your company"));
        }

        String stateName = state.toUpperCase(Locale.ROOT);
        Set<String> allowed = Set.of("APPROVED", "DENIED");

        if (!allowed.contains(stateName)) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Unsupported state. Allowed: " + allowed));
        }

        TimestatementState ts = timestatementStateRepository.findByName(stateName)
                .orElseThrow(() -> new RuntimeException("State " + stateName + " not found"));

        TimestatementStateChange change = new TimestatementStateChange();
        change.setDocument(doc);
        change.setTimestatementState(ts);
        change.setEmployee(user);
        change.setStateChangedAt(new Timestamp(System.currentTimeMillis()));

        timestatementStateChangeRepository.save(change);

        return ResponseEntity.ok(Map.of(
                "documentId", doc.getId(),
                "newState", stateName
        ));
    }



}
