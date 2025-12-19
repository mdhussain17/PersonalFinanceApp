package com.budgetwise.backend.service;

import com.budgetwise.backend.dto.TransactionDto;
import com.budgetwise.backend.dto.UserDto;
import java.util.List;
import java.util.Map;

public interface AdminService {
    
    List<UserDto> getAllUsers(); // Feature 1: Get all users
    
    Map<String, Object> getDashboardSummary(); // Feature 2: Get site-wide stats

    List<TransactionDto> getTransactionsForUser(Long userId); // Feature 3: Get user's transactions
    
    List<String> getAllCategories(); // Feature 4: Get all categories in use

    void deleteUserAccount(Long userId); // Feature 5: Delete a user
}