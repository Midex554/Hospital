package com.medicore.hospital_backend.model;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import jakarta.persistence.Column;

@Entity
@Table(name = "Patient")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

public class Patient {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String firstName;
    private String lastName;
    private String gender;
    private String dateOfBirth;
    private String phone;
    private String email;

    private String bloodGroup;
    private String genotype;
    private String emergencyContactName;
    private String emergencyContactPhone;

    @Column(length = 1000)
    private String allergies;

    @Column(length = 2000)
    private String medicalHistory;

    private String profileImageUrl;

    @Column(columnDefinition = "Text")
    private String address;

    public String getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(String dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public String getBloodGroup() { return bloodGroup; }
    public void setBloodGroup(String bloodGroup) { this.bloodGroup = bloodGroup; }

    public String getGenotype() { return genotype; }
    public void setGenotype(String genotype) { this.genotype = genotype; }

    public String getEmergencyContactName() { return emergencyContactName; }
    public void setEmergencyContactName(String emergencyContactName) { this.emergencyContactName = emergencyContactName; }

    public String getEmergencyContactPhone() { return emergencyContactPhone; }
    public void setEmergencyContactPhone(String emergencyContactPhone) { this.emergencyContactPhone = emergencyContactPhone; }

    public String getAllergies() { return allergies; }
    public void setAllergies(String allergies) { this.allergies = allergies; }

    public String getMedicalHistory() { return medicalHistory; }
    public void setMedicalHistory(String medicalHistory) { this.medicalHistory = medicalHistory; }

    public String getProfileImageUrl() { return profileImageUrl; }
    public void setProfileImageUrl(String profileImageUrl) { this.profileImageUrl = profileImageUrl; }

    private LocalDateTime createdAt = LocalDateTime.now();
}
