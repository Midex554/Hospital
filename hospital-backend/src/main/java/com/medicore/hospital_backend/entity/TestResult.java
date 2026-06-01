package com.medicore.hospital_backend.entity;

import com.medicore.hospital_backend.model.Doctor;
import com.medicore.hospital_backend.model.Patient;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class TestResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String testName;

    @Column(length = 1000)
    private String description;

    private String fileName;
    private String fileType;
    private String fileUrl;

    private String status = "UPLOADED";

    private LocalDateTime uploadedAt = LocalDateTime.now();

    @ManyToOne
    @JoinColumn (name = "patient_id")
    private Patient patient;

    @ManyToOne
    @JoinColumn(name = "doctor_id")
    private Doctor doctor;

    public Long getId() { return id; }
    public String getTestName() { return testName; }
    public String getDescription() { return description; }
    public String getFileName() { return fileName; }
    public String getFileType() { return fileType; }
    public String getFileUrl() { return fileUrl; }
    public String getStatus() { return status; }
    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public Patient getPatient() { return patient; }
    public Doctor getDoctor() { return  doctor; }

    public void setTestName(String testName) { this.testName = testName; }
    public void setDescription(String description) { this.description = description; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    public void setFileType(String fileType) { this.fileType = fileType; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }
    public void setStatus(String status) { this.status = status; }
    public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }
    public void setPatient(Patient patient) { this.patient = patient; }
    public void setDoctor(Doctor doctor) { this. doctor = doctor; }



}
