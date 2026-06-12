package com.medicore.hospital_backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.medicore.hospital_backend.model.Doctor;
import com.medicore.hospital_backend.model.Patient;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "test_results")
public class TestResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String testName;

    @Column(length = 1000)
    private String description;

    @Column(length = 2000)
    private String doctorComment;

    private LocalDateTime reviewedAt;

    private String fileName;
    private String fileType;

    @Column(length = 1000)
    private String fileUrl;

    private String status = "UPLOADED";

    private LocalDateTime uploadedAt = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "patient_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Patient patient;

    @ManyToOne
    @JoinColumn(name = "doctor_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Doctor doctor;

    public Long getId() { return id; }

    public void setId(Long id) { this.id = id; }

    public String getTestName() { return testName; }

    public void setTestName(String testName) { this.testName = testName; }

    public String getDescription() { return description; }

    public void setDescription(String description) { this.description = description; }

    public String getFileName() { return fileName; }

    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getFileType() { return fileType; }

    public void setFileType(String fileType) { this.fileType = fileType; }

    public String getFileUrl() { return fileUrl; }

    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }

    public String getStatus() { return status; }

    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getUploadedAt() { return uploadedAt; }

    public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }

    public String getDoctorComment() {
        return doctorComment;
    }

    public void setDoctorComment(String doctorComment) {
        this.doctorComment = doctorComment;
    }

    public LocalDateTime getReviewedAt() {
        return reviewedAt;
    }

    public void setReviewedAt(LocalDateTime reviewedAt) {
        this.reviewedAt = reviewedAt;
    }

    public Patient getPatient() { return patient; }

    public void setPatient(Patient patient) { this.patient = patient; }

    public Doctor getDoctor() { return doctor; }

    public void setDoctor(Doctor doctor) { this.doctor = doctor; }
}