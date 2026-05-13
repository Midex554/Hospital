package com.medicore.hospital_backend.dto;
import com.medicore.hospital_backend.model.Role;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor

public class RegisterResponse {
    private Long id;
    private String fullNmae;
    private String email;
    private Role role;

}
