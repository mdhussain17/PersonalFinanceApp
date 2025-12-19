package com.budgetwise.backend.dto;

import lombok.Data;

@Data
public class OtpRequestDto {
    private String email;
    private String otp;
}