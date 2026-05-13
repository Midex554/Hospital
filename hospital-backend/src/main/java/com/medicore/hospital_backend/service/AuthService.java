package com.medicore.hospital_backend.service;
import com.medicore.hospital_backend.dto.LoginResponse;
import com.medicore.hospital_backend.dto.RegisterResponse;
import com.medicore.hospital_backend.model.User;
import com.medicore.hospital_backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.medicore.hospital_backend.dto.LoginResponse;
import com.medicore.hospital_backend.dto.RegisterResponse;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;

    }

    public RegisterResponse register(User user)  {
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

        return new LoginResponse(token, user.getEmail(), user.getRole());
    }

}
