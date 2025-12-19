package com.budgetwise.backend.dto;

// --- THIS IS THE FIX ---
// We import the Role enum from inside the User entity
import com.budgetwise.backend.entity.User.Role; 
import lombok.Data;

@Data
public class UserDto {
    private Long id;
    private String email; 
    
    // 2. Change the type from String to Role
    private Role role; 
}