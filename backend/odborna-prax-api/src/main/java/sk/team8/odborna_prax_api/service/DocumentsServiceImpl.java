package sk.team8.odborna_prax_api.service;

import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import sk.team8.odborna_prax_api.Entity.*;
import sk.team8.odborna_prax_api.dao.*;
import sk.team8.odborna_prax_api.dto.DocumentDownloadResponse;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.sql.Timestamp;

@Service
@RequiredArgsConstructor
public class DocumentsServiceImpl implements DocumentsService {

    private final DocumentsRepository documentsRepository;
    private final DocumentTypeRepository documentTypeRepository;
    private final TimestatementStateRepository timestatementStateRepository;
    private final TimestatementStateChangeRepository timestatementStateChangeRepository;
    private final InternshipRepository internshipRepository;
    private final UserRepository userRepository;

    @Override
    public void uploadTimestatement(Integer internshipId, MultipartFile file, String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Internship internship = internshipRepository.findById(internshipId)
                .orElseThrow(() -> new RuntimeException("Internship not found"));

        if (internship.getStudent().getId() != user.getId()) {
            throw new RuntimeException("Unauthorized: student does not own this internship.");
        }

        DocumentType type = documentTypeRepository.findById(2)
                .orElseThrow(() -> new RuntimeException("DocumentType not found"));

        try {
            Files.createDirectories(Paths.get("uploads"));
        } catch (IOException e) {
            throw new RuntimeException("Failed to create uploads folder");
        }

        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        Path filePath = Paths.get("uploads").resolve(fileName);

        try {
            Files.copy(file.getInputStream(), filePath);
        } catch (IOException e) {
            throw new RuntimeException("Failed to save file");
        }

        Documents document = new Documents(
                type,
                internship,
                fileName,
                new Timestamp(System.currentTimeMillis())
        );
        documentsRepository.save(document);

        TimestatementState stateUploaded = timestatementStateRepository.findById(1)
                .orElseThrow(() -> new RuntimeException("TimestatementState UPLOADED not found"));

        TimestatementStateChange stateChange = new TimestatementStateChange(
                document,
                stateUploaded,
                user,
                new Timestamp(System.currentTimeMillis())
        );

        timestatementStateChangeRepository.save(stateChange);
    }

    @Override
    public DocumentDownloadResponse downloadDocument(Integer documentId) {

        Documents doc = documentsRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        Path filePath = Paths.get("uploads").resolve(doc.getDocumentName());

        try {
            return new DocumentDownloadResponse(
                    doc.getDocumentName(),
                    new InputStreamResource(Files.newInputStream(filePath))
            );
        } catch (IOException e) {
            throw new RuntimeException("Document file missing on server");
        }
    }

    public void uploadContract(Integer internshipId, MultipartFile file, String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Internship internship = internshipRepository.findById(internshipId)
                .orElseThrow(() -> new RuntimeException("Internship not found"));

        // autorizácia
        if (internship.getStudent().getId() != user.getId()) {
            throw new RuntimeException("Unauthorized: student does not own this internship.");
        }

        DocumentType type = documentTypeRepository.findById(1) // CONTRACT
                .orElseThrow(() -> new RuntimeException("DocumentType CONTRACT not found"));

        try {
            Files.createDirectories(Paths.get("uploads"));
        } catch (IOException e) {
            throw new RuntimeException("Failed to create uploads folder");
        }

        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        Path filePath = Paths.get("uploads").resolve(fileName);

        try {
            Files.copy(file.getInputStream(), filePath);
        } catch (IOException e) {
            throw new RuntimeException("Failed to save contract file");
        }

        Documents document = new Documents(
                type,
                internship,
                fileName,
                new Timestamp(System.currentTimeMillis())
        );

        documentsRepository.save(document);
    }

}
