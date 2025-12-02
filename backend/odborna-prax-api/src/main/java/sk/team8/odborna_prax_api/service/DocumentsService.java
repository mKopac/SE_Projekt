package sk.team8.odborna_prax_api.service;

import org.springframework.web.multipart.MultipartFile;
import sk.team8.odborna_prax_api.dto.DocumentDownloadResponse;

public interface DocumentsService {

    void uploadTimestatement(Integer internshipId, MultipartFile file, String email);

    DocumentDownloadResponse downloadDocument(Integer documentId);

    void uploadContract(Integer internshipId, MultipartFile file, String name);
}
