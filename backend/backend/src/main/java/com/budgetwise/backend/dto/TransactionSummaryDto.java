package com.budgetwise.backend.dto;

import lombok.Data;

@Data
public class TransactionSummaryDto {

    private double totalIncome;     // SUM(all INCOME)
    private double totalExpenses;   // SUM(all EXPENSE)
    private double totalSavings;    // SUM(all SAVINGS)
    
    /**
     * Your new formula: (Income - Expenses) - Savings
     * This is the money left over for daily spending.
     */
    private double availableBalance;
}