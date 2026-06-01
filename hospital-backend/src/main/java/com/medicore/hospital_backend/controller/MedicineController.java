package com.medicore.hospital_backend.controller;

import com.medicore.hospital_backend.entity.Medicine;
import com.medicore.hospital_backend.repository.MedicineRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/medicines")
@CrossOrigin(origins = "*")
public class MedicineController {

    private final MedicineRepository medicineRepository;

    public MedicineController(MedicineRepository medicineRepository) {
        this.medicineRepository = medicineRepository;
    }

    @GetMapping
    public List<Medicine> getAllMedicines() {
        return medicineRepository.findAll();
    }

    @PostMapping
    public Medicine createMedicine(@RequestBody Medicine medicine) {
        return medicineRepository.save(medicine);
    }

    @PutMapping("/{id}")
    public Medicine updateMedicine(@PathVariable Long id, @RequestBody Medicine medicine) {
        Medicine existing = medicineRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medicine not found"));

        existing.setMedicineName(medicine.getMedicineName());
        existing.setCategory(medicine.getCategory());
        existing.setQuantity(medicine.getQuantity());
        existing.setPrice(medicine.getPrice());
        existing.setStatus(medicine.getStatus());

        return medicineRepository.save(existing);
    }

    @DeleteMapping("/{id}")
    public String deleteMedicine(@PathVariable Long id) {
        medicineRepository.deleteById(id);
        return "Medicine deleted successfully";
    }
}