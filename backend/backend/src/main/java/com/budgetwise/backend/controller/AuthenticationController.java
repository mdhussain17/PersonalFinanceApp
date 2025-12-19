package com.budgetwise.backend.controller;

import com.budgetwise.backend.dto.ForgotPasswordRequestDto;
import com.budgetwise.backend.dto.JwtAuthenticationResponse;
import com.budgetwise.backend.dto.OtpRequestDto;
import com.budgetwise.backend.dto.ResetPasswordRequestDto;
import com.budgetwise.backend.dto.SignInRequest;
import com.budgetwise.backend.dto.SignUpRequest;
import com.budgetwise.backend.service.AuthenticationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthenticationService authenticationService;

    /**
     * [cite_start]Handles new user registration, which includes sending an OTP for verification. [cite: 58, 68]
     */
    @PostMapping("/signup")
    public ResponseEntity<String> signup(@RequestBody SignUpRequest request) {
        String responseMessage = authenticationService.signup(request);
        return ResponseEntity.ok(responseMessage);
    }

    /**
     * Handles OTP verification to activate a new user's account.
     */
    @PostMapping("/verify-otp")
    public ResponseEntity<String> verifyOtp(@RequestBody OtpRequestDto otpRequestDto) {
        authenticationService.verifyOtp(otpRequestDto);
        return ResponseEntity.ok("OTP verified successfully. Your account is now active.");
    }

    /**
     * [cite_start]Handles user login for verified users. [cite: 61, 78]
     */
    @PostMapping("/signin")
    public ResponseEntity<JwtAuthenticationResponse> signin(@RequestBody SignInRequest request) {
        return ResponseEntity.ok(authenticationService.signin(request));
    }

    /**
     * Handles the initial request for a password reset, triggering an OTP email.
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody ForgotPasswordRequestDto request) {
        authenticationService.requestPasswordReset(request.getEmail());
        return ResponseEntity.ok("Password reset OTP has been sent to your email.");
    }

    /**
     * Handles the final step of resetting a password using an OTP.
     */
    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody ResetPasswordRequestDto request) {
        authenticationService.resetPassword(request);
        return ResponseEntity.ok("Password has been reset successfully.");
    }
}