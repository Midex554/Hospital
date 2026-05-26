package com.medicore.hospital_backend.service;

import com.medicore.hospital_backend.model.Doctor;
import com.medicore.hospital_backend.model.DoctorShift;
import com.medicore.hospital_backend.model.ShiftStatus;
import com.medicore.hospital_backend.repository.DoctorShiftRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class DoctorAssignmentService {

    private final DoctorShiftRepository doctorShiftRepository;

    public DoctorAssignmentService(
            DoctorShiftRepository doctorShiftRepository
    ) {
        this.doctorShiftRepository = doctorShiftRepository;
    }

    public Doctor assignDoctor(String complaint) {

        String specialization = detectSpecialization(complaint);

        List<DoctorShift> availableDoctors =
                doctorShiftRepository.findByShiftDateAndStatus(
                        LocalDate.now(),
                        ShiftStatus.ON_DUTY
                );

        for (DoctorShift shift : availableDoctors) {

            Doctor doctor = shift.getDoctor();

            if (
                    doctor.getSpecialization() != null &&
                            doctor.getSpecialization()
                                    .equalsIgnoreCase(specialization)
            ) {
                return doctor;
            }
        }

        for (DoctorShift shift : availableDoctors) {
            Doctor doctor = shift.getDoctor();

            if (
                    doctor.getSpecialization() != null &&
                            doctor.getSpecialization()
                                    .equalsIgnoreCase("General Medicine")
            ) {
                return doctor;
            }
        }

        return null;
    }

    public String detectSpecialization(String complaint) {

        if (complaint == null) {
            return "General Medicine";
        }

        complaint = complaint.toLowerCase();

        if (
                complaint.contains("heart") ||
                        complaint.contains("chest pain") ||
                        complaint.contains("blood pressure")
        ) {
            return "Cardiology";
        }

        if (
                complaint.contains("skin") ||
                        complaint.contains("rash") ||
                        complaint.contains("eczema")
        ) {
            return "Dermatology";
        }

        if (
                complaint.contains("pregnancy") ||
                        complaint.contains("baby") ||
                        complaint.contains("delivery")
        ) {
            return "Gynecology";
        }

        if (
                complaint.contains("child") ||
                        complaint.contains("children") ||
                        complaint.contains("fever")
        ) {
            return "Pediatrics";
        }

        if (
                complaint.contains("bone") ||
                        complaint.contains("leg") ||
                        complaint.contains("fracture")
        ) {
            return "Orthopedics";
        }

        if (
                complaint.contains("eye") ||
                        complaint.contains("vision")
        ) {
            return "Ophthalmology";
        }

        if (
                complaint.contains("brain") ||
                        complaint.contains("headache")
        ) {
            return "Neurology";
        }

        return "General Medicine";
    }
}