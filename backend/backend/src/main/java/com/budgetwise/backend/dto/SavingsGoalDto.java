package com.budgetwise.backend.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class SavingsGoalDto {
    private Long id;
    private String goalName;
    private Double targetAmount;
    private Double currentAmount; // This will now be calculated
    private LocalDate deadline;
    
    // --- ADD THIS FIELD ---
    private Double remainingAmount; // (target - current)
}