package sk.team8.odborna_prax_api.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.core.io.Resource;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import sk.team8.odborna_prax_api.dto.DocumentDownloadResponse;
import sk.team8.odborna_prax_api.service.DocumentsService;

import java.security.Principal;

@RestController
@RequestMapping("/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentsService documentsService;

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
}
