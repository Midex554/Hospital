package com.medicore.hospital_backend.model;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "doctors")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor


public class Doctor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String firstName;
    private String lastName;
    private String specialization;
    private String phone;
    private String email;
    private String gender;

    //Profesional profile
    private String qualification;
    private String experienceYears;
    private String licenseNumber;
    private String officeLocation;
    private String availability;
    private String profileImageUrl;

    @Column(length = 2000)
    private String bio;

    @Column(length = 3000)
    private String achievement;

    @Column(length = 3000)
    private String certification;

    //Acount relationtionship
    @OneToOne
    @JoinColumn(name = "user id")
    private User user;

    private LocalDateTime createdAt = LocalDateTime.now();
}
