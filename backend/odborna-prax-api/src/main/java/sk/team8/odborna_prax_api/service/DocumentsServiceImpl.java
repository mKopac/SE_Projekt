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

import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.apache.poi.xwpf.usermodel.XWPFRun;
import org.apache.poi.xwpf.usermodel.XWPFTable;
import org.apache.poi.xwpf.usermodel.XWPFTableRow;
import org.apache.poi.xwpf.usermodel.XWPFTableCell;
import org.springframework.core.io.ByteArrayResource;

import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.time.format.DateTimeFormatter;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;


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
    public DocumentDownloadResponse generateContractForInternship(Integer internshipId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Internship internship = internshipRepository.findById(internshipId)
                .orElseThrow(() -> new RuntimeException("Internship not found"));

        if (internship.getStudent().getId() != user.getId()) {
            throw new RuntimeException("Unauthorized: student does not own this internship.");
        }

        Company company = internship.getCompany();

        Map<String, String> replacements = new HashMap<>();

        String studentFirstName = internship.getStudent().getFirstName();
        String studentLastName  = internship.getStudent().getLastName();
        String studentEmail     = internship.getStudent().getEmail();

        replacements.put("{{STUDENT_FIRST_NAME}}", studentFirstName);
        replacements.put("{{STUDENT_LAST_NAME}}", studentLastName);
        replacements.put("{{STUDENT_FULL_NAME}}", studentFirstName + " " + studentLastName);


        replacements.put("{{STUDENT_EMAIL}}", studentEmail);
        replacements.put("{{STUDENT_CONTACT}}", studentEmail);
        String studyProgram = internship.getStudent().getFieldOfStudy().getName();
        if (studyProgram == null) {
            studyProgram = "";
        }
        replacements.put("{{STUDENT_STUDY_PROGRAM}}", studyProgram);

        Address addr = internship.getStudent().getAddress();
        String studentAddress = "";
        if (addr != null) {
            studentAddress = addr.toString();
        }
        replacements.put("{{STUDENT_ADDRESS}}", studentAddress);

        replacements.put("{{COMPANY_NAME}}", company.getName());

        String companyAddress = "";
        if (company.getAddress() != null) {
            companyAddress = company.getAddress().toString();
        }
        replacements.put("{{COMPANY_ADDRESS}}", companyAddress);

        User mentor = internship.getMentor();
        String mentorName = "";
        if (mentor != null) {
            mentorName = mentor.getFirstName() + " " + mentor.getLastName();
        }
        replacements.put("{{MENTOR}}", mentorName);

        replacements.put("{{INTERNSHIP_ACADEMIC_YEAR}}", internship.getAcademicYear());
        replacements.put("{{INTERNSHIP_SEMESTER}}", String.valueOf(internship.getSemester()));

        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd.MM.yyyy");

        String startStr = "";
        if (internship.getDateStart() != null) {
            LocalDate ds = internship.getDateStart().toLocalDate();
            startStr = ds.format(dateFormatter);
        }
        replacements.put("{{INTERNSHIP_DATE_START}}", startStr);

        String endStr = "";
        if (internship.getDateEnd() != null) {
            LocalDate de = internship.getDateEnd().toLocalDate();
            endStr = de.format(dateFormatter);
        }
        replacements.put("{{INTERNSHIP_DATE_END}}", endStr);

        replacements.put("{{TODAY_DATE}}", LocalDate.now().format(dateFormatter));

        try {
            Resource template = new ClassPathResource("documents/Ziadost_o_prax.docx");

            try (InputStream is = template.getInputStream();
                 XWPFDocument document = new XWPFDocument(is);
                 ByteArrayOutputStream baos = new ByteArrayOutputStream()) {

                replaceTextInDocument(document, replacements);

                document.write(baos);

                ByteArrayInputStream bais = new ByteArrayInputStream(baos.toByteArray());

                String fileName = "Ziadost_o_prax_" + studentLastName + ".docx";

                return new DocumentDownloadResponse(
                        fileName,
                        new InputStreamResource(bais)
                );
            }
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate contract", e);
        }
    }



    private void replaceTextInDocument(XWPFDocument document, Map<String, String> replacements) {
        for (XWPFParagraph p : document.getParagraphs()) {
            replaceInParagraph(p, replacements);
        }

        for (XWPFTable table : document.getTables()) {
            for (XWPFTableRow row : table.getRows()) {
                for (XWPFTableCell cell : row.getTableCells()) {
                    for (XWPFParagraph p : cell.getParagraphs()) {
                        replaceInParagraph(p, replacements);
                    }
                }
            }
        }
    }

    private void replaceInParagraph(XWPFParagraph paragraph, Map<String, String> replacements) {
        for (XWPFRun run : paragraph.getRuns()) {
            String text = run.getText(0);
            if (text == null) continue;

            String replaced = text;
            for (Map.Entry<String, String> entry : replacements.entrySet()) {
                if (replaced.contains(entry.getKey())) {
                    replaced = replaced.replace(entry.getKey(), entry.getValue());
                }
            }

            if (!replaced.equals(text)) {
                run.setText(replaced, 0);
            }
        }
    }

}
