package com.medicore.hospital_backend.repository;
import com.medicore.hospital_backend.model.Patient;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PatientRepository extends JpaRepository<Patient, Long> {
}
