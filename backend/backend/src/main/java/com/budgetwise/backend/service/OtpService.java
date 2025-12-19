package com.budgetwise.backend.service;

import org.springframework.stereotype.Service;
import java.util.Random;

@Service
public class OtpService {

    public String generateOtp() {
        Random random = new Random();
        // This generates a number between 100000 and 999999
        int otpNumber = 100000 + random.nextInt(900000); 
        return String.valueOf(otpNumber);
    }
}