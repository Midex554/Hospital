package com.medicore.hospital_backend.repository;

import com.medicore.hospital_backend.entity.Medicine;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MedicineRepository extends JpaRepository<Medicine, Long> {
}