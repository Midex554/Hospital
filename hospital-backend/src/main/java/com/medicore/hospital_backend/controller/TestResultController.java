package com.medicore.hospital_backend.controller;

import com.medicore.hospital_backend.entity.TestResult;
import com.medicore.hospital_backend.model.Doctor;
import com.medicore.hospital_backend.model.Patient;
import com.medicore.hospital_backend.repository.TestResultRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/test-results")
@CrossOrigin(origins = "*")
public class TestResultController {

    private final TestResultRepository testResultRepository;

    @Value("${file.upload-dir}")
    private String uploadDir;

    public TestResultController(TestResultRepository testResultRepository) {
        this.testResultRepository = testResultRepository;
    }

    @PostMapping("/upload")
    public TestResult uploadTestResult(
            @RequestParam("testName") String testName,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("patientId") Long patientId,
            @RequestParam("doctorId") Long doctorId,
            @RequestParam("file") MultipartFile file
    ) {
        try {
            if (testName == null || testName.trim().isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Test name is required.");
            }

            if (patientId == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Patient ID is required.");
            }

            if (doctorId == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Doctor ID is required.");
            }

            if (file == null || file.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File is required.");
            }

            String contentType = file.getContentType();

            if (
                    contentType == null ||
                            !(
                                    contentType.equals("application/pdf") ||
                                            contentType.equals("image/jpeg") ||
                                            contentType.equals("image/png") ||
                                            contentType.equals("image/jpg")
                            )
            ) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Only PDF, JPG, JPEG, and PNG files are allowed."
                );
            }

            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();

            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String originalFileName = file.getOriginalFilename();
            String extension = "";

            if (originalFileName != null && originalFileName.contains(".")) {
                extension = originalFileName.substring(originalFileName.lastIndexOf("."));
            }

            String savedFileName = UUID.randomUUID() + extension;
            Path filePath = uploadPath.resolve(savedFileName).normalize();

            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            Patient patient = new Patient();
            patient.setId(patientId);

            Doctor doctor = new Doctor();
            doctor.setId(doctorId);

            TestResult result = new TestResult();
            result.setTestName(testName.trim());
            result.setDescription(description);
            result.setFileName(originalFileName);
            result.setFileType(contentType);
            result.setFileUrl("/uploads/test-results/" + savedFileName);
            result.setPatient(patient);
            result.setDoctor(doctor);
            result.setStatus("UPLOADED");
            result.setUploadedAt(LocalDateTime.now());

            return testResultRepository.save(result);

        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Failed to upload test result: " + e.getMessage()
            );
        }
    }

    @GetMapping
    public List<TestResult> getAllTestResults() {
        return testResultRepository.findAll();
    }

    @GetMapping("/patient/{patientId}")
    public List<TestResult> getPatientResults(@PathVariable Long patientId) {
        return testResultRepository.findByPatientId(patientId);
    }

    @GetMapping("/doctor/{doctorId}")
    public List<TestResult> getDoctorResults(@PathVariable Long doctorId) {
        return testResultRepository.findByDoctorId(doctorId);
    }

    public static class ReviewRequest {
        private String doctorComment;

        public String getDoctorComment() {
            return doctorComment;
        }

        public void setDoctorComment(String doctorComment) {
            this.doctorComment = doctorComment;
        }
    }

    @PutMapping("/{id}/review")
    public TestResult reviewTestResult(
            @PathVariable Long id,
            @RequestBody ReviewRequest request
    ) {
        TestResult result = testResultRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Test result not found."
                ));

        if (request.getDoctorComment() == null || request.getDoctorComment().trim().isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Doctor comment is required."
            );
        }

        result.setDoctorComment(request.getDoctorComment().trim());
        result.setStatus("REVIEWED");
        result.setReviewedAt(LocalDateTime.now());

        return testResultRepository.save(result);
    }git

    @DeleteMapping("/{id}")
    public void deleteTestResult(@PathVariable Long id) {
        if (!testResultRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Test result not found.");
        }

        testResultRepository.deleteById(id);
    }
}