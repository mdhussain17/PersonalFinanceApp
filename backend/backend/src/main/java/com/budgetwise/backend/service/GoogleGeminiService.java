package com.budgetwise.backend.service;

import com.budgetwise.backend.ai.dto.ExpensePredictionDto; // <-- ADD THIS NEW IMPORT
import com.budgetwise.backend.dto.SavingsGoalDto;
import com.budgetwise.backend.dto.TransactionDto;
import com.budgetwise.backend.dto.TransactionSummaryDto;
import java.util.List;

public interface GoogleGeminiService {

    // --- Your 3 original AI methods ---
    String generateMonthlyInsights(TransactionSummaryDto summary);
    String generatePredictionAndAlerts(String transactionHistoryJson);
    String getCategoryForTransaction(String description, List<String> categories);

    // --- Your 6 Chatbot methods ---
    String generateChatResponse(String prompt);
    String generateSpendingBreakdown(List<TransactionDto> transactions);
    String generateSavingTipsForGoal(SavingsGoalDto goal);
    String generateTransactionDetails(List<TransactionDto> transactions);
    String generatePersonalizedInsights(TransactionSummaryDto summary, List<TransactionDto> transactions);
    String generateGoalTrackingAnalysis(List<SavingsGoalDto> goals, TransactionSummaryDto summary);
    
    // ---
    // --- ADD THIS NEW METHOD FOR THE CHART ---
    // ---
    
    /**
     * Uses linear regression to predict future expenses based on past 6 months.
     * Returns structured data (numbers) for the chart.
     */
    ExpensePredictionDto getExpensePrediction(String userEmail);
    
    /**
     * Generates a conversational prediction for next month's expenses.
     * Returns text for the UI chat bubble.
     */
    String generateNextMonthExpensePrediction(String userEmail);
}