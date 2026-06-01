package com.medicore.hospital_backend.service;

import com.medicore.hospital_backend.entity.MedicalRecord;
import com.medicore.hospital_backend.model.*;
import com.medicore.hospital_backend.repository.*;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MedicalRecordService {

    private final MedicalRecordRepository medicalRecordRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;

    public MedicalRecordService(
            MedicalRecordRepository medicalRecordRepository,
            PatientRepository patientRepository,
            DoctorRepository doctorRepository
    ) {
        this.medicalRecordRepository = medicalRecordRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
    }

    public MedicalRecord createRecord(MedicalRecord record) {

        Patient patient = patientRepository.findById(
                record.getPatient().getId()
        ).orElseThrow(() -> new RuntimeException("Patient not found"));

        Doctor doctor = doctorRepository.findById(
                record.getDoctor().getId()
        ).orElseThrow(() -> new RuntimeException("Doctor not found"));

        record.setPatient(patient);
        record.setDoctor(doctor);

        return medicalRecordRepository.save(record);
    }

    public List<MedicalRecord> getAllRecords() {
        return medicalRecordRepository.findAll();
    }

    public List<MedicalRecord> getRecordsByPatient(Long patientId) {
        return medicalRecordRepository.findByPatientId(patientId);
    }

    public List<MedicalRecord> getRecordsByDoctor(Long doctorId) {
        return medicalRecordRepository.findByDoctorId(doctorId);
    }
}