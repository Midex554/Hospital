package com.medicore.hospital_backend.repository;

import com.medicore.hospital_backend.model.DoctorShift;
import com.medicore.hospital_backend.model.ShiftStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface DoctorShiftRepository extends JpaRepository<DoctorShift, Long> {

    List<DoctorShift> findByShiftDate(LocalDate shiftDate);

    List<DoctorShift> findByStatus(ShiftStatus status);

    List<DoctorShift> findByDoctorId(Long doctorId);

    List<DoctorShift> findByShiftDateAndStatus(LocalDate shiftDate, ShiftStatus status);
}