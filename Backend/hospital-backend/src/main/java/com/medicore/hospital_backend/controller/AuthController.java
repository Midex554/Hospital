package com.medicore.hospital_backend.controller;
import com.medicore.hospital_backend.dto.LoginResponse;
import com.medicore.hospital_backend.dto.RegisterResponse;
import com.medicore.hospital_backend.model.User;
import com.medicore.hospital_backend.service.AuthService;
import org.springframework.web.bind.annotation.*;
import com.medicore.hospital_backend.dto.LoginResponse;
import com.medicore.hospital_backend.dto.RegisterResponse;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin("*")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public RegisterResponse register(@RequestBody User user) {
        return authService.register(user);
    }

    @PostMapping("/login")
    public LoginResponse login(@RequestBody User loginRequest) {
        return authService.login(loginRequest.getEmail(), loginRequest.getPassword());
    }
}
