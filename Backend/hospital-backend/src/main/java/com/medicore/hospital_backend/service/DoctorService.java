package com.medicore.hospital_backend.service;
import com.medicore.hospital_backend.model.Doctor;
import com.medicore.hospital_backend.repository.DoctorRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DoctorService {

    private final DoctorRepository doctorRepository;

    public DoctorService (DoctorRepository doctorRepository) {
        this.doctorRepository = doctorRepository;
    }

    //Get all patients
    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }

    //Create Doctor
    public Doctor createDoctor(Doctor patient) {
        return doctorRepository.save(patient);
    }

    public Doctor getDoctorById(Long id) {
        return doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
    }

    public Doctor updateDoctor(Long id, Doctor doctorDetails) {
        Doctor doctor = getDoctorById(id);

        doctor.setFirstName(doctorDetails.getFirstName());
        doctor.setLastName(doctorDetails.getLastName());
        doctorDetails.setSpecialization(doctorDetails.getSpecialization());
        doctor.setPhone(doctorDetails.getPhone());
        doctor.setEmail(doctorDetails.getEmail());



        return doctorRepository.save(doctor);
    }

    public void deleteDoctor(Long id) {
        Doctor doctor = getDoctorById(id);
        doctorRepository.delete(doctor);
    }



}
