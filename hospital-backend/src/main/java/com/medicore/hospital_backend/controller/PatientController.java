package com.medicore.hospital_backend.controller;
import com.medicore.hospital_backend.model.Patient;
import com.medicore.hospital_backend.service.PatientService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@RestController
@RequestMapping("/api/patients")
@CrossOrigin("*")

public class PatientController {

    private final PatientService patientService;

    public PatientController(PatientService patientService){
        this.patientService = patientService;
    }

    // Get all patient
    @GetMapping
    public List<Patient> getAllPatients() {
        return patientService.getAllPatients();
    }

    //Post create patient
    @PostMapping
    public Patient createPatient(@RequestBody Patient patient) {
        return patientService.createPatient(patient);
    }

    @GetMapping("/{id}")
    public Patient getPatientById(@PathVariable Long id) {
        return patientService.getPatientById(id);
    }

    @PutMapping("/{id}")
    public Patient updatePatient(@PathVariable Long id, @RequestBody Patient patient) {
        return patientService.updatePatient(id, patient);
    }

    @DeleteMapping("/{id}")
    public String deletePatient(@PathVariable Long id) {
        patientService.deletePatient(id);
        return "Patient data deleted successfully";
    }
}
