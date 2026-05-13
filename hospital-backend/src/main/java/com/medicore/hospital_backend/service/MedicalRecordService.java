package com.medicore.hospital_backend.service;
import com.medicore.hospital_backend.model.MedicalRecord;
import com.medicore.hospital_backend.model.Patient;
import com.medicore.hospital_backend.repository.MedicalRecordRepository;
import com.medicore.hospital_backend.repository.PatientRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MedicalRecordService {

    private final MedicalRecordRepository medicalRecordRepository;
    private final PatientRepository patientRepository;

    public MedicalRecordService(MedicalRecordRepository medicalRecordRepository,
                                PatientRepository patientRepository) {
        this.medicalRecordRepository = medicalRecordRepository;
        this.patientRepository = patientRepository;
    }

    //Get all patients
    public List<MedicalRecord> getAllMedicalRecords() {
        return medicalRecordRepository.findAll();
    }

    //Create Patient
    public MedicalRecord createMedicalRecords(MedicalRecord medicalRecord) {
        Long patientId = medicalRecord.getPatient().getId();

        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient Record Not Found"));

        medicalRecord.setPatient(patient);

        return medicalRecordRepository.save(medicalRecord);
    }

    public MedicalRecord getMedicalRecordById(Long id) {
        return medicalRecordRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medical Record not found"));
    }

    public MedicalRecord updateMedicalRecord(Long id, MedicalRecord details) {
        MedicalRecord record = getMedicalRecordById(id);

        record.setDiagnosis(details.getDiagnosis());
        record.setTreatment(details.getTreatment());
        record.setPrescription(details.getPrescription());
        record.setNotes(details.getNotes());

        return medicalRecordRepository.save(record);
    }

    public void deleteMedicalRecord(Long id) {
        MedicalRecord record = getMedicalRecordById(id);
        medicalRecordRepository.delete(record);
    }



}
