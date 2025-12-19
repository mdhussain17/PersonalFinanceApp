package com.budgetwise.backend.controller;

import com.budgetwise.backend.dto.ProfileDto;
import com.budgetwise.backend.dto.ProfileUpdateRequestDto;
import com.budgetwise.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /**
     * Gets the profile information for the currently logged-in user.
     */
    @GetMapping("/profile")
    public ResponseEntity<ProfileDto> getCurrentUserProfile(Authentication authentication) {
        String userEmail = authentication.getName();
        ProfileDto profileDto = userService.getUserProfile(userEmail);
        return ResponseEntity.ok(profileDto);
    }

    /**
     * Updates the profile information for the currently logged-in user.
     */
    @PutMapping("/profile")
    public ResponseEntity<String> updateUserProfile(Authentication authentication, @RequestBody ProfileUpdateRequestDto request) {
        String userEmail = authentication.getName();
        userService.updateUserProfile(userEmail, request);
        return ResponseEntity.ok("Profile updated successfully!");
    }
}