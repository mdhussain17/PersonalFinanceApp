package com.budgetwise.backend.service;
import com.budgetwise.backend.dto.BudgetDto;
import java.util.List;

public interface BudgetService {
    BudgetDto createBudget(String userEmail, BudgetDto budgetDto);
    List<BudgetDto> getBudgetsByUser(String userEmail);

    // ADD THESE NEW METHODS
    BudgetDto updateBudget(String userEmail, Long budgetId, BudgetDto budgetDto);
    void deleteBudget(String userEmail, Long budgetId);
}