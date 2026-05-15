package com.medicore.hospital_backend.service;
import com.medicore.hospital_backend.model.Patient;
import com.medicore.hospital_backend.repository.AppointmentRepository;
import com.medicore.hospital_backend.repository.BillRepository;
import com.medicore.hospital_backend.repository.PatientRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PatientService {

    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;
    private final BillRepository billRepository;

    public PatientService(PatientRepository patientRepository,
                          AppointmentRepository appointmentRepository,
                          BillRepository billRepository) {
        this.patientRepository = patientRepository;
        this.appointmentRepository = appointmentRepository;
        this.billRepository = billRepository;
    }

    //Get all patients
    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }

    //Create Patient
    public Patient createPatient(Patient patient) {
        return patientRepository.save(patient);
    }

    public Patient getPatientById(Long id) {
        return patientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
    }

    public Patient updatePatient(Long id, Patient patientDetails) {
        Patient patient = getPatientById(id);

        patient.setFirstName(patientDetails.getFirstName());
        patient.setLastName(patientDetails.getLastName());
        patient.setGender(patientDetails.getGender());
        patient.setDateOfBirth(patientDetails.getDateOfBirth());
        patient.setPhone(patientDetails.getPhone());
        patient.setEmail(patientDetails.getEmail());
        patient.setAddress(patientDetails.getAddress());
        patient.setBloodGroup(patientDetails.getBloodGroup());

        return patientRepository.save(patient);
    }

    public void deletePatient(Long id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not Found"));

        boolean hasAppointment = appointmentRepository.existsByPatientId(id);
        boolean hassBills = billRepository.existsByPatientId(id);

        if (hasAppointment || hassBills) {
            throw new RuntimeException(
                    "Patient cannot be deleted because they have appointment or bills"
            );
        }

        patientRepository.delete(patient);

    }



}
