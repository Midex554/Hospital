package com.medicore.hospital_backend.service;

import com.medicore.hospital_backend.model.Appointment;
import com.medicore.hospital_backend.model.Doctor;
import com.medicore.hospital_backend.model.Patient;
import com.medicore.hospital_backend.repository.AppointmentRepository;
import com.medicore.hospital_backend.repository.PatientRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorAssignmentService doctorAssignmentService;

    public AppointmentService(
            AppointmentRepository appointmentRepository,
            PatientRepository patientRepository,
            DoctorAssignmentService doctorAssignmentService
    ) {
        this.appointmentRepository = appointmentRepository;
        this.patientRepository = patientRepository;
        this.doctorAssignmentService = doctorAssignmentService;
    }

    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    public List<Appointment> getAppointmentsByPatient(Long patientId) {
        return appointmentRepository.findByPatientId(patientId);
    }

    public List<Appointment> getAppointmentsByDoctor(Long doctorId) {
        return appointmentRepository.findByDoctorId(doctorId);
    }

    public Appointment createAppointment(Appointment appointment) {
        if (appointment.getPatient() == null || appointment.getPatient().getId() == null) {
            throw new RuntimeException("Patient is required");
        }

        if (appointment.getComplaint() == null || appointment.getComplaint().trim().isEmpty()) {
            throw new RuntimeException("Complaint is required for doctor assignment");
        }

        Long patientId = appointment.getPatient().getId();

        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));

        Doctor assignedDoctor = doctorAssignmentService.assignDoctor(
                appointment.getComplaint()
        );

        if (assignedDoctor == null) {
            throw new RuntimeException("No available doctor is currently on duty");
        }

        appointment.setPatient(patient);
        appointment.setDoctor(assignedDoctor);

        if (appointment.getStatus() == null || appointment.getStatus().isBlank()) {
            appointment.setStatus("Pending");
        }

        return appointmentRepository.save(appointment);
    }

    public Appointment updateAppointment(Long id, Appointment appointmentDetails) {
        Appointment appointment = getAppointmentById(id);

        appointment.setAppointmentDate(appointmentDetails.getAppointmentDate());
        appointment.setComplaint(appointmentDetails.getComplaint());
        appointment.setStatus(appointmentDetails.getStatus());
        appointment.setNotes(appointmentDetails.getNotes());

        return appointmentRepository.save(appointment);
    }

    public Appointment updateAppointmentStatus(Long id, String status) {
        Appointment appointment = getAppointmentById(id);
        appointment.setStatus(status);
        return appointmentRepository.save(appointment);
    }

    public Appointment getAppointmentById(Long id) {
        return appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
    }

    public void deleteAppointment(Long id) {
        Appointment appointment = getAppointmentById(id);
        appointmentRepository.delete(appointment);
    }
}