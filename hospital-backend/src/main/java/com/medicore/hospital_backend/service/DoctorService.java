package com.medicore.hospital_backend.service;

import com.medicore.hospital_backend.model.Doctor;
import com.medicore.hospital_backend.model.Role;
import com.medicore.hospital_backend.model.User;
import com.medicore.hospital_backend.repository.DoctorRepository;
import com.medicore.hospital_backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DoctorService(
            DoctorRepository doctorRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.doctorRepository = doctorRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }

    public Doctor createDoctor(Doctor doctor) {
        if (doctor.getEmail() == null || doctor.getEmail().isBlank()) {
            throw new RuntimeException("Doctor email is required");
        }

        if (userRepository.findByEmail(doctor.getEmail()).isPresent()) {
            throw new RuntimeException("A user with this email already exists");
        }

        Doctor savedDoctor = doctorRepository.save(doctor);

        User user = new User();
        user.setFullName(savedDoctor.getFirstName() + " " + savedDoctor.getLastName());
        user.setEmail(savedDoctor.getEmail());
        user.setPassword(passwordEncoder.encode("12345678"));
        user.setRole(Role.DOCTOR);

        User savedUser = userRepository.save(user);

        savedDoctor.setUser(savedUser);

        return doctorRepository.save(savedDoctor);
    }

    public Doctor getDoctorById(Long id) {
        return doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
    }

    public Doctor updateDoctor(Long id, Doctor doctorDetails) {
        Doctor doctor = getDoctorById(id);

        doctor.setFirstName(doctorDetails.getFirstName());
        doctor.setLastName(doctorDetails.getLastName());
        doctor.setSpecialization(doctorDetails.getSpecialization());
        doctor.setPhone(doctorDetails.getPhone());
        doctor.setEmail(doctorDetails.getEmail());

        return doctorRepository.save(doctor);
    }

    public void deleteDoctor(Long id) {
        Doctor doctor = getDoctorById(id);
        doctorRepository.delete(doctor);
    }
}