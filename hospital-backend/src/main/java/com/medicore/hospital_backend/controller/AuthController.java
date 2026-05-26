package com.medicore.hospital_backend.controller;

import com.medicore.hospital_backend.dto.LoginResponse;
import com.medicore.hospital_backend.dto.PatientRegisterRequest;
import com.medicore.hospital_backend.dto.RegisterResponse;
import com.medicore.hospital_backend.model.Patient;
import com.medicore.hospital_backend.model.Role;
import com.medicore.hospital_backend.model.User;
import com.medicore.hospital_backend.repository.PatientRepository;
import com.medicore.hospital_backend.repository.UserRepository;
import com.medicore.hospital_backend.service.AuthService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin("*")
public class AuthController {

    private final AuthService authService;
    private final PasswordEncoder passwordEncoder;
    private final PatientRepository patientRepository;
    private final UserRepository userRepository;

    public AuthController(
            AuthService authService,
            PasswordEncoder passwordEncoder,
            PatientRepository patientRepository,
            UserRepository userRepository
    ) {
        this.authService = authService;
        this.passwordEncoder = passwordEncoder;
        this.patientRepository = patientRepository;
        this.userRepository = userRepository;
    }

    @PostMapping("/register")
    public RegisterResponse register(@RequestBody User user) {
        return authService.register(user);
    }

    @PostMapping("/login")
    public LoginResponse login(@RequestBody User loginRequest) {
        return authService.login(
                loginRequest.getEmail(),
                loginRequest.getPassword()
        );
    }

    @PostMapping("/patient/register")
    public String registerPatient(
            @RequestBody PatientRegisterRequest request
    ) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();

        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.PATIENT);

        userRepository.save(user);

        Patient patient = new Patient();

        patient.setFirstName(request.getFirstName());
        patient.setLastName(request.getLastName());
        patient.setEmail(request.getEmail());
        patient.setPhone(request.getPhone());
        patient.setGender(request.getGender());
        patient.setAddress(request.getAddress());

        patientRepository.save(patient);

        return "Patient registered successfully";
    }
}