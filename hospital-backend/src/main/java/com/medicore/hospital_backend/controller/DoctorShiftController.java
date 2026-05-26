package com.medicore.hospital_backend.controller;

import com.medicore.hospital_backend.model.DoctorShift;
import com.medicore.hospital_backend.service.DoctorShiftService;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/doctor-shifts")
@CrossOrigin("*")
public class DoctorShiftController {

    private final DoctorShiftService doctorShiftService;

    public DoctorShiftController(DoctorShiftService doctorShiftService) {
        this.doctorShiftService = doctorShiftService;
    }

    @GetMapping
    public List<DoctorShift> getAllShifts() {
        return doctorShiftService.getAllShifts();
    }

    @PostMapping
    public DoctorShift createShift(@RequestBody DoctorShift shift) {
        return doctorShiftService.createShift(shift);
    }

    @PutMapping("/{id}")
    public DoctorShift updateShift(
            @PathVariable Long id,
            @RequestBody DoctorShift shift
    ) {
        return doctorShiftService.updateShift(id, shift);
    }

    @DeleteMapping("/{id}")
    public String deleteShift(@PathVariable Long id) {
        doctorShiftService.deleteShift(id);
        return "Doctor shift deleted successfully";
    }

    @GetMapping("/date/{date}")
    public List<DoctorShift> getShiftsByDate(@PathVariable LocalDate date) {
        return doctorShiftService.getShiftsByDate(date);
    }

    @GetMapping("/on-duty/today")
    public List<DoctorShift> getOnDutyDoctorsToday() {
        return doctorShiftService.getOnDutyDoctorsToday();
    }
}