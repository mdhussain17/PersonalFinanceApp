package com.budgetwise.backend.service;

import com.budgetwise.backend.dto.ProfileDto;
import com.budgetwise.backend.dto.ProfileUpdateRequestDto;

public interface UserService {

    /**
     * This method gets the user's profile information.
     */
    ProfileDto getUserProfile(String email);

    /**
     * This method updates a user's profile.
     */
    void updateUserProfile(String email, ProfileUpdateRequestDto request);

    // ---
    // --- THIS IS THE FIX ---
    // ---
    /**
     * Deletes a user and all their associated data.
     */
    void deleteUserAccount(String email);
}