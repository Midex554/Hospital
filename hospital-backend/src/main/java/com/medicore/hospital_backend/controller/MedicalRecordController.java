package com.medicore.hospital_backend.controller;

import com.medicore.hospital_backend.entity.MedicalRecord;
import com.medicore.hospital_backend.service.MedicalRecordService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/medical-records")
@CrossOrigin("*")
public class MedicalRecordController {

    private final MedicalRecordService medicalRecordService;

    public MedicalRecordController(MedicalRecordService medicalRecordService) {
        this.medicalRecordService = medicalRecordService;
    }

    @PostMapping
    public MedicalRecord createRecord(@RequestBody MedicalRecord record) {
        return medicalRecordService.createRecord(record);
    }

    @GetMapping
    public List<MedicalRecord> getAllRecords() {
        return medicalRecordService.getAllRecords();
    }

    @GetMapping("/patient/{patientId}")
    public List<MedicalRecord> getRecordsByPatient(
            @PathVariable Long patientId
    ) {
        return medicalRecordService.getRecordsByPatient(patientId);
    }

    @GetMapping("/doctor/{doctorId}")
    public List<MedicalRecord> getRecordsByDoctor(
            @PathVariable Long doctorId
    ) {
        return medicalRecordService.getRecordsByDoctor(doctorId);
    }
}