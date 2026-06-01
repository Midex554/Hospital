package com.medicore.hospital_backend.controller;

import com.medicore.hospital_backend.entity.TestResult;
import com.medicore.hospital_backend.model.Doctor;
import com.medicore.hospital_backend.model.Patient;
import com.medicore.hospital_backend.repository.TestResultRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.*;
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
    ) throws Exception {

        Path uploadPath = Paths.get(uploadDir);

        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String originalFileName = file.getOriginalFilename();
        String extension = "";

        if (originalFileName != null && originalFileName.contains(".")) {
            extension = originalFileName.substring(originalFileName.lastIndexOf("."));
        }

        String savedFileName = UUID.randomUUID() + extension;

        Path filePath = uploadPath.resolve(savedFileName);

        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        Patient patient = new Patient();
        patient.setId(patientId);

        Doctor doctor = new Doctor();
        doctor.setId(doctorId);

        TestResult result = new TestResult();
        result.setTestName(testName);
        result.setDescription(description);
        result.setFileName(originalFileName);
        result.setFileType(file.getContentType());
        result.setFileUrl("/uploads/test-results/" + savedFileName);
        result.setPatient(patient);
        result.setDoctor(doctor);
        result.setStatus("UPLOADED");

        return testResultRepository.save(result);
    }

    @PostMapping
    public TestResult createTestResult(@RequestBody TestResult testResult) {
        return testResultRepository.save(testResult);
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

    @DeleteMapping("/{id}")
    public void deleteTestResult(@PathVariable Long id) {
        testResultRepository.deleteById(id);
    }
}