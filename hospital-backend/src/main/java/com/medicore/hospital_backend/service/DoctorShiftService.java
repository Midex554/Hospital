package com.medicore.hospital_backend.service;

import com.medicore.hospital_backend.model.Doctor;
import com.medicore.hospital_backend.model.DoctorShift;
import com.medicore.hospital_backend.model.ShiftStatus;
import com.medicore.hospital_backend.repository.DoctorRepository;
import com.medicore.hospital_backend.repository.DoctorShiftRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class DoctorShiftService {

    private final DoctorShiftRepository doctorShiftRepository;
    private final DoctorRepository doctorRepository;

    public DoctorShiftService(
            DoctorShiftRepository doctorShiftRepository,
            DoctorRepository doctorRepository
    ) {
        this.doctorShiftRepository = doctorShiftRepository;
        this.doctorRepository = doctorRepository;
    }

    public List<DoctorShift> getAllShifts() {
        return doctorShiftRepository.findAll();
    }

    public DoctorShift createShift(DoctorShift shift) {
        Long doctorId = shift.getDoctor().getId();

        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        shift.setDoctor(doctor);

        return doctorShiftRepository.save(shift);
    }

    public DoctorShift updateShift(Long id, DoctorShift updatedShift) {
        DoctorShift existingShift = doctorShiftRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Shift not found"));

        Long doctorId = updatedShift.getDoctor().getId();

        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        existingShift.setDoctor(doctor);
        existingShift.setShiftDate(updatedShift.getShiftDate());
        existingShift.setStartTime(updatedShift.getStartTime());
        existingShift.setEndTime(updatedShift.getEndTime());
        existingShift.setStatus(updatedShift.getStatus());

        return doctorShiftRepository.save(existingShift);
    }

    public void deleteShift(Long id) {
        doctorShiftRepository.deleteById(id);
    }

    public List<DoctorShift> getShiftsByDate(LocalDate date) {
        return doctorShiftRepository.findByShiftDate(date);
    }

    public List<DoctorShift> getOnDutyDoctorsToday() {
        return doctorShiftRepository.findByShiftDateAndStatus(
                LocalDate.now(),
                ShiftStatus.ON_DUTY
        );
    }
}