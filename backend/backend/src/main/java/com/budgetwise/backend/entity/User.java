package com.budgetwise.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "users")
public class User implements UserDetails, Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    // --- THIS IS THE FIX ---
    @Enumerated(EnumType.STRING) // 1. Tell JPA to save the enum as a String
    @Column(nullable = false)
    private Role role; // 2. Change the type from String to Role
    // --- END FIX ---

    private String otp;

    @Column(name = "otp_expiry_time")
    private LocalDateTime otpExpiryTime;

    @Column(name = "is_enabled")
    private boolean isEnabled;

    // ... (your profile fields are correct) ...
    @Column(name = "monthly_income")
    private Double monthlyIncome;

    @Column(name = "savings_goal")
    private Double savingsGoal;

    @Column(name = "target_expenses")
    private Double targetExpenses;

    // This is for Google Drive Backup
    @Column(length = 1024)
    private String googleRefreshToken;
    
    // --- 3. Add this enum definition ---
    public enum Role {
        USER,
        ADMIN
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // --- 4. This is the other part of the fix ---
        // It tells Spring Security the user's role
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    // ... (rest of your UserDetails methods are unchanged) ...
    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return this.isEnabled;
    }
}