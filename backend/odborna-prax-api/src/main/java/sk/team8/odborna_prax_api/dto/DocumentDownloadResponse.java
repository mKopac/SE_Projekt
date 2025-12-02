package sk.team8.odborna_prax_api.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.core.io.InputStreamResource;

@Getter
@AllArgsConstructor
public class DocumentDownloadResponse {
    private String fileName;
    private InputStreamResource resource;
}