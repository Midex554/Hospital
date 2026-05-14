package com.medicore.hospital_backend.repository;
import com.medicore.hospital_backend.model.Bill;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BillRepository extends JpaRepository<Bill, Long> {
}
