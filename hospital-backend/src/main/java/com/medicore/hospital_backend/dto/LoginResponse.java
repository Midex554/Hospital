package com.medicore.hospital_backend.dto;
import com.medicore.hospital_backend.model.Role;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor

public class LoginResponse {
    private String token;
    private String email;
    private Role role;
}
