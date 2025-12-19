package com.budgetwise.backend.controller;

import com.budgetwise.backend.dto.CategorySpendingDto;
import com.budgetwise.backend.dto.TransactionDto;
import com.budgetwise.backend.dto.TransactionSummaryDto; // <-- 1. Added this import
import com.budgetwise.backend.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/transactions") // Base URL for all transaction-related APIs
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService; // The "chef" for transactions

    /**
     * Creates a new transaction for the currently logged-in user.
     */
    @PostMapping
    public ResponseEntity<TransactionDto> createTransaction(Authentication authentication, @RequestBody TransactionDto transactionDto) {
        String userEmail = authentication.getName(); // Get logged-in user's email
        TransactionDto createdTransaction = transactionService.createTransaction(userEmail, transactionDto);
        return new ResponseEntity<>(createdTransaction, HttpStatus.CREATED); // Return 201 Created status
    }

    /**
     * Retrieves all transactions for the currently logged-in user.
     */
    @GetMapping
    public ResponseEntity<List<TransactionDto>> getUserTransactions(Authentication authentication) {
        String userEmail = authentication.getName(); // Get logged-in user's email
        List<TransactionDto> transactions = transactionService.getTransactionsByUser(userEmail);
        return ResponseEntity.ok(transactions); // Return the list of transactions
    }

    /**
     * Updates an existing transaction for the currently logged-in user.
     */
    @PutMapping("/{id}") // The {id} part is a variable representing the transaction ID
    public ResponseEntity<TransactionDto> updateTransaction(Authentication authentication, @PathVariable Long id, @RequestBody TransactionDto transactionDto) {
        String userEmail = authentication.getName(); // Get logged-in user's email
        TransactionDto updatedTransaction = transactionService.updateTransaction(userEmail, id, transactionDto);
        return ResponseEntity.ok(updatedTransaction); // Return the updated transaction
    }

    /**
     * Deletes a transaction for the currently logged-in user.
     */
    @DeleteMapping("/{id}") // The {id} part is the ID of the transaction to delete
    public ResponseEntity<String> deleteTransaction(Authentication authentication, @PathVariable Long id) {
        String userEmail = authentication.getName(); // Get logged-in user's email
        transactionService.deleteTransaction(userEmail, id);
        return ResponseEntity.ok("Transaction deleted successfully."); // Return a success message
    }

    /**
     * Retrieves spending data grouped by category for the currently logged-in user.
     * This endpoint is used for Milestone 4 (Visualization).
     */
    @GetMapping("/spending-by-category")
    public ResponseEntity<List<CategorySpendingDto>> getSpendingByCategory(Authentication authentication) {
        String userEmail = authentication.getName(); // Get logged-in user's email
        List<CategorySpendingDto> spendingData = transactionService.getSpendingByCategory(userEmail);
        return ResponseEntity.ok(spendingData); // Return the summarized data for charts
    }
    
    // --- 2. Added this new endpoint ---
    
    /**
     * Retrieves the financial summary (total income, expenses, balance)
     * for the currently logged-in user. This is for the main dashboard.
     */
    @GetMapping("/summary")
    public ResponseEntity<TransactionSummaryDto> getTransactionSummary(Authentication authentication) {
        String userEmail = authentication.getName();
        TransactionSummaryDto summary = transactionService.getTransactionSummary(userEmail);
        return ResponseEntity.ok(summary);
    }
}