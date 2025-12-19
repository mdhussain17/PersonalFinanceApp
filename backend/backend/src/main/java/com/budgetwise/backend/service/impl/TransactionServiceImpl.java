package com.budgetwise.backend.service.impl;

// Necessary Imports
import com.budgetwise.backend.dto.CategorySpendingDto;
import com.budgetwise.backend.dto.TransactionDto;
import com.budgetwise.backend.dto.TransactionSummaryDto;
import com.budgetwise.backend.entity.Transaction;
import com.budgetwise.backend.entity.User;
import com.budgetwise.backend.repository.TransactionRepository;
import com.budgetwise.backend.repository.UserRepository;
import com.budgetwise.backend.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TransactionServiceImpl implements TransactionService {

    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;

    @Override
    public TransactionDto createTransaction(String userEmail, TransactionDto transactionDto) {
        User user = findUserByEmail(userEmail);
        Transaction transaction = mapToEntity(transactionDto);
        transaction.setUser(user);
        Transaction savedTransaction = transactionRepository.save(transaction);
        return mapToDto(savedTransaction);
    }

    @Override
    public List<TransactionDto> getTransactionsByUser(String userEmail) {
        User user = findUserByEmail(userEmail);
        List<Transaction> transactions = transactionRepository.findByUserId(user.getId());
        return transactions.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    public TransactionDto updateTransaction(String userEmail, Long transactionId, TransactionDto transactionDto) {
        User user = findUserByEmail(userEmail);
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Transaction not found with id: " + transactionId));

        if (!transaction.getUser().getId().equals(user.getId())) {
            throw new SecurityException("You are not authorized to update this transaction.");
        }

        transaction.setType(transactionDto.getType().toUpperCase()); // Ensure type is uppercase
        transaction.setAmount(transactionDto.getAmount());
        transaction.setCategory(transactionDto.getCategory());
        transaction.setDescription(transactionDto.getDescription());
        transaction.setDate(transactionDto.getDate());

        Transaction updatedTransaction = transactionRepository.save(transaction);
        return mapToDto(updatedTransaction);
    }

    @Override
    public void deleteTransaction(String userEmail, Long transactionId) {
        User user = findUserByEmail(userEmail);
        
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Transaction not found with id: " + transactionId));

        if (!transaction.getUser().getId().equals(user.getId())) {
            throw new SecurityException("You are not authorized to delete this transaction.");
        }
        transactionRepository.delete(transaction);
    }

    /**
     * Calculates total spending for each category (for charts).
     */
    @Override
    public List<CategorySpendingDto> getSpendingByCategory(String userEmail) {
        User user = findUserByEmail(userEmail);
        List<Transaction> transactions = transactionRepository.findByUserId(user.getId());

        Map<String, Double> spendingMap = transactions.stream()
                .filter(t -> "EXPENSE".equalsIgnoreCase(t.getType()))
                .collect(Collectors.groupingBy(
                        Transaction::getCategory,
                        Collectors.summingDouble(Transaction::getAmount)
                ));

        return spendingMap.entrySet().stream()
                .map(entry -> new CategorySpendingDto(entry.getKey(), entry.getValue()))
                .collect(Collectors.toList());
    }

    /**
     * UPDATED: Calculates the full summary based on the new logic.
     */
    @Override
    public TransactionSummaryDto getTransactionSummary(String userEmail) {
        User user = findUserByEmail(userEmail);
        Long userId = user.getId();

        // 1. Call all 3 queries (INCOME, EXPENSE, SAVINGS)
        double totalIncome = transactionRepository.getTotalIncomeByUserId(userId);
        double totalExpenses = transactionRepository.getTotalExpensesByUserId(userId);
        double totalSavings = transactionRepository.getTotalSavingsByUserId(userId);

        // 2. Calculate availableBalance as per your formula
        // (Income - Expenses) - Total Saved = Available
        double availableBalance = totalIncome - totalExpenses - totalSavings;
        
        // 3. Populate the new DTO
        TransactionSummaryDto summary = new TransactionSummaryDto();
        summary.setTotalIncome(totalIncome);
        summary.setTotalExpenses(totalExpenses);
        summary.setTotalSavings(totalSavings); // The net amount saved
        summary.setAvailableBalance(availableBalance); // The leftover spending money
        
        return summary;
    }

    // --- Helper Methods ---
    
    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
    }

    private TransactionDto mapToDto(Transaction transaction) {
        TransactionDto dto = new TransactionDto();
        dto.setId(transaction.getId());
        dto.setType(transaction.getType());
        dto.setAmount(transaction.getAmount());
        dto.setCategory(transaction.getCategory());
        dto.setDescription(transaction.getDescription());
        dto.setDate(transaction.getDate());
        return dto;
    }

    private Transaction mapToEntity(TransactionDto dto) {
        Transaction transaction = new Transaction();
        transaction.setType(dto.getType().toUpperCase()); // Always store type as uppercase
        transaction.setAmount(dto.getAmount());
        transaction.setCategory(dto.getCategory());
        transaction.setDescription(dto.getDescription());
        transaction.setDate(dto.getDate());
        return transaction;
    }
}