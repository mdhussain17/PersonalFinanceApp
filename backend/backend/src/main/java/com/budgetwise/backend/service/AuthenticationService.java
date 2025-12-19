package com.budgetwise.backend.service;

import com.budgetwise.backend.dto.JwtAuthenticationResponse;
import com.budgetwise.backend.dto.OtpRequestDto;
import com.budgetwise.backend.dto.ResetPasswordRequestDto;
import com.budgetwise.backend.dto.SignInRequest;
import com.budgetwise.backend.dto.SignUpRequest;
import com.budgetwise.backend.entity.User; // <-- Make sure this is imported
import com.budgetwise.backend.repository.UserRepository;
import com.budgetwise.backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;
    private final OtpService otpService;

    public String signup(SignUpRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already in use.");
        }

        String otp = otpService.generateOtp();

        var user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                
                // --- THIS IS THE FIX ---
                // We now use the 'Role' enum, not a String
                .role(User.Role.USER) 
                
                .otp(otp)
                .otpExpiryTime(LocalDateTime.now().plusMinutes(10))
                .isEnabled(false)
                .build();

        userRepository.save(user);

        String emailBody = "Welcome! Your One-Time Password (OTP) for account verification is: " + otp;
        emailService.sendSimpleEmail(user.getEmail(), "Verify Your Account", emailBody);

        return "User registered successfully. Please check your email for the OTP.";
    }

    public void verifyOtp(OtpRequestDto otpRequestDto) {
        // ... (this method is unchanged and correct)
        User user = userRepository.findByEmail(otpRequestDto.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        if (user.getOtp() == null || !user.getOtp().equals(otpRequestDto.getOtp())) {
            throw new IllegalArgumentException("Invalid OTP.");
        }
        if (user.getOtpExpiryTime().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("OTP has expired.");
        }

        user.setEnabled(true);
        user.setOtp(null);
        user.setOtpExpiryTime(null);
        userRepository.save(user);
    }

    public JwtAuthenticationResponse signin(SignInRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password."));

        if (!user.isEnabled()) {
            throw new IllegalStateException("Please verify your email with the OTP before logging in.");
        }

        var jwt = jwtUtil.generateToken(user); 

        // --- THIS IS THE FIX ---
        // user.getRole() is now an enum, so .name() will return the String "USER" or "ADMIN"
        return JwtAuthenticationResponse.builder()
                .token(jwt)
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name()) // This line is now fixed
                .build();
    }

    // ... (rest of your password reset methods are unchanged) ...
    
    public void requestPasswordReset(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with this email."));

        String otp = otpService.generateOtp();
        user.setOtp(otp);
        user.setOtpExpiryTime(LocalDateTime.now().plusMinutes(10));
        userRepository.save(user);

        String emailBody = "You have requested a password reset. Your OTP is: " + otp;
        emailService.sendSimpleEmail(user.getEmail(), "Password Reset OTP", emailBody);
    }

    public void resetPassword(ResetPasswordRequestDto request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("User not found."));

        if (user.getOtp() == null || !user.getOtp().equals(request.getOtp())) {
            throw new IllegalArgumentException("Invalid OTP.");
        }
        if (user.getOtpExpiryTime().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("OTP has expired.");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setOtp(null);
        user.setOtpExpiryTime(null);
        userRepository.save(user);
    }
}