package com.medicore.hospital_backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter

public class PatientRegisterRequest {

    private String firstName;
    private String lastName;
    private String email;
    private String password;
    private String phone;
    private Integer age;
    private String gender;
    private String address;
}
