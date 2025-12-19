package com.budgetwise.backend.service;

import com.budgetwise.backend.dto.CategorySpendingDto;
import com.budgetwise.backend.dto.TransactionDto;
import com.budgetwise.backend.dto.TransactionSummaryDto; // <-- 1. Import this DTO
import java.util.List;

public interface TransactionService {

    TransactionDto createTransaction(String userEmail, TransactionDto transactionDto);
    
    List<TransactionDto> getTransactionsByUser(String userEmail);
    
    TransactionDto updateTransaction(String userEmail, Long transactionId, TransactionDto transactionDto);
    
    void deleteTransaction(String userEmail, Long transactionId);
    
    // This is the method from your screenshot (for pie charts)
    List<CategorySpendingDto> getSpendingByCategory(String userEmail);
    
    // --- 2. Add this new method ---
    // This is the method for your main dashboard summary
    TransactionSummaryDto getTransactionSummary(String userEmail);
}