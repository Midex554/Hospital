package com.medicore.hospital_backend.controller;
import com.medicore.hospital_backend.repository.AppointmentRepository;
import com.medicore.hospital_backend.repository.DoctorRepository;
import com.medicore.hospital_backend.repository.PatientRepository;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")

public class DashboardContrller {

    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;
    
    public DashboardContrller(
            PatientRepository patientRepository;
            DoctorRepository doctorRepository;
            AppointmentRepository appointmentRepository;
    ) {
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.appointmentRepository = appointmentRepository;
    }

    @GetMapping("/stats")
    public Map<String, Long> getStats() {
        long patients = patientRepository.count();
        long doctors = doctorRepository.count();
        long apppointment = appointmentRepository.count();

        return Map.of(
                "patients", patients,
                "doctors", doctors,
                "appointment", apppointment
        );
    }
}
