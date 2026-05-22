package com.medicore.hospital_backend.controller;
import com.medicore.hospital_backend.repository.PatientRepository;
import com.medicore.hospital_backend.repository.AppointmentRepository;
import com.medicore.hospital_backend.repository.BillRepository;
import com.medicore.hospital_backend.repository.MedicalRecordRepository;

import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin("*")

public class DashboardController {

    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;
    private final BillRepository billRepository;
    private final MedicalRecordRepository medicalRecordRepository;

    public DashboardController(
            PatientRepository patientRepository,
            AppointmentRepository appointmentRepository,
            BillRepository billRepository,
            MedicalRecordRepository medicalRecordRepository
    ) {
        this.patientRepository = patientRepository;
        this.appointmentRepository = appointmentRepository;
        this.billRepository = billRepository;
        this.medicalRecordRepository = medicalRecordRepository;
    }

    @GetMapping("/stats")
    public Map<String, Object> getDashboardStats() {

        Map<String, Object> stats = new HashMap<>();

        stats.put("patients", patientRepository.count());

        stats.put("appointment", appointmentRepository.count());

        stats.put("medicalRecords", medicalRecordRepository.count());

        stats.put("bills", billRepository.count());

        return stats;
    }
}
