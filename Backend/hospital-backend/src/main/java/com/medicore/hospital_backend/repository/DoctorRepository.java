package com.medicore.hospital_backend.repository;
import com.medicore.hospital_backend.model.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {
}
