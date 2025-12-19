package com.budgetwise.backend.dto;

import lombok.Data;

@Data
public class ProfileUpdateRequestDto {
    private String name;
    private Double monthlyIncome;
    private Double savingsGoal;
    private Double targetExpenses;
}