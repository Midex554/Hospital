package com.medicore.hospital_backend.service;
import com.medicore.hospital_backend.model.Bill;
import com.medicore.hospital_backend.model.Patient;
import com.medicore.hospital_backend.repository.BillRepository;
import com.medicore.hospital_backend.repository.PatientRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BillService {

    private final BillRepository billRepository;
    private final PatientRepository patientRepository;

    public BillService(BillRepository billRepository,
                                PatientRepository patientRepository) {
        this.billRepository = billRepository;
        this.patientRepository = patientRepository;
    }

    //Get all patients
    public List<Bill> getAllBills() {
        return billRepository.findAll();
    }

    //Create Patient
    public Bill createBill(Bill bill) {
        Long patientId = bill.getPatient().getId();

        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient Record Not Found"));

        bill.setPatient(patient);

        return billRepository.save(bill);
    }

    public Bill getBillById(Long id) {
        return billRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bill Record not found"));
    }

    public Bill updateBill(Long id, Bill billDetails) {
        Bill bill = getBillById(id);

        bill.setBillName(billDetails.getBillName());
        bill.setAmount(billDetails.getAmount());
        bill.setStatus(billDetails.getStatus());

        return billRepository.save(bill);
    }

    public void deleteBill(Long id) {
        Bill bill = getBillById(id);
        billRepository.delete(bill);
    }



}
