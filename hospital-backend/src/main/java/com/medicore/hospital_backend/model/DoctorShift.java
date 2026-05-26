package com.medicore.hospital_backend.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "doctor-shifts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

public class DoctorShift {

    @Id@GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate shiftDate;

    private LocalTime startTime;

    private LocalTime endTime;

    @Enumerated(EnumType.STRING)
    private ShiftStatus status = ShiftStatus.ON_DUTY;

    @ManyToOne
    @JoinColumn(name = "doctor_id")
    private Doctor doctor;
}
