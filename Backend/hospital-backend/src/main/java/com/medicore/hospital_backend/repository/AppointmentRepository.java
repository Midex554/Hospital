package com.medicore.hospital_backend.repository;
import com.medicore.hospital_backend.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    boolean existsByPatientId(Long patientId);
}
