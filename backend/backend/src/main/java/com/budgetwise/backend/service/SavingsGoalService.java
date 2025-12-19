package com.budgetwise.backend.service;

import com.budgetwise.backend.dto.SavingsGoalDto;
import java.util.List;

public interface SavingsGoalService {
    SavingsGoalDto createSavingsGoal(String userEmail, SavingsGoalDto savingsGoalDto);
    List<SavingsGoalDto> getSavingsGoalsByUser(String userEmail);

    // ADD THESE LINES
    SavingsGoalDto updateSavingsGoal(String userEmail, Long goalId, SavingsGoalDto savingsGoalDto);
    void deleteSavingsGoal(String userEmail, Long goalId);
}