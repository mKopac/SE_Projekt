package sk.team8.odborna_prax_api.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
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

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> download(@PathVariable Integer id) {

        DocumentDownloadResponse response = documentsService.downloadDocument(id);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + response.getFileName() + "\""
                )
                .body(response.getResource());
    }
}
