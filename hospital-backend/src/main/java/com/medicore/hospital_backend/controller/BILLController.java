package com.medicore.hospital_backend.controller;
import com.medicore.hospital_backend.model.Bill;
import com.medicore.hospital_backend.service.BillService;
import com.medicore.hospital_backend.service.MedicalRecordService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@RestController
@RequestMapping("/api/bills")
@CrossOrigin("*")

public class BILLController {

    private final BillService billService;

    public BILLController(BillService billService){
        this.billService = billService;
    }

    // Get all patient
    @GetMapping
    public List<Bill> getAllBill() {
        return billService.getAllBills();
    }

    //Post create patient
    @PostMapping
    public Bill createBill(@RequestBody Bill bill) {
        return billService.createBill(bill);
    }

    @GetMapping("/{id}")
    public Bill getBillById(@PathVariable Long id) {
        return billService.getBillById(id);
    }

    @PutMapping("/{id}")
    public Bill updateBill(@PathVariable Long id, @RequestBody Bill bill) {
        return billService.updateBill(id, bill);
    }

    @DeleteMapping("/{id}")
    public String deleteBill(@PathVariable Long id) {
        billService.deleteBill(id);
        return "Bill deleted successfully";
    }
}
