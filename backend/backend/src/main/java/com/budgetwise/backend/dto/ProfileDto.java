package com.budgetwise.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProfileDto {
    private String name;
    private String email;
    private Double monthlyIncome;
    private Double savingsGoal;
    private Double targetExpenses;
}