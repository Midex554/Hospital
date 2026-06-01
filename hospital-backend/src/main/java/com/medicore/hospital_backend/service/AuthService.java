package com.medicore.hospital_backend.service;
import com.medicore.hospital_backend.dto.LoginResponse;
import com.medicore.hospital_backend.dto.RegisterResponse;
import com.medicore.hospital_backend.model.User;
import com.medicore.hospital_backend.model.Patient;
import com.medicore.hospital_backend.repository.PatientRepository;
import com.medicore.hospital_backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.medicore.hospital_backend.dto.LoginResponse;
import com.medicore.hospital_backend.dto.RegisterResponse;
import com.medicore.hospital_backend.model.Doctor;
import com.medicore.hospital_backend.repository.DoctorRepository;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            PatientRepository patientRepository,
            DoctorRepository doctorRepository
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
    }

    public RegisterResponse register(User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        User savedUser = userRepository.save(user);

        return new RegisterResponse(
                savedUser.getId(),
                savedUser.getFullName(),
                savedUser.getEmail(),
                savedUser.getRole()
        );
    }

    public LoginResponse login(String email, String password){
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(password, user.getPassword())){
            throw new RuntimeException("Invalid email or password");
        }
        String token = jwtService.generateToken(user);

        Object userDetails = user;

        if (user.getRole().name().equals("PATIENT")) {
            Patient patient = patientRepository.findByEmail(email).orElse(null);

            if (patient != null) {
                userDetails = patient;
            }
        }

        if (user.getRole().name().equals("DOCTOR")) {
            Doctor doctor = doctorRepository.findByUserId(user.getId()).orElse(null);

            if (doctor != null) {
                userDetails = doctor;
            }
        }

        return new LoginResponse(token, user.getRole().name(), userDetails);
    }

}
