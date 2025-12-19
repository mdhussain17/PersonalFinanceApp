package com.budgetwise.backend.service.impl;

import com.budgetwise.backend.dto.TransactionDto;
import com.budgetwise.backend.dto.UserDto;
import com.budgetwise.backend.entity.Transaction; // <-- MAKE SURE THIS IMPORT IS HERE
import com.budgetwise.backend.entity.User;
import com.budgetwise.backend.repository.BudgetRepository;
import com.budgetwise.backend.repository.SavingsGoalRepository;
import com.budgetwise.backend.repository.TransactionRepository;
import com.budgetwise.backend.repository.UserRepository;
import com.budgetwise.backend.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    // Inject only the repositories you have
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final BudgetRepository budgetRepository;
    private final SavingsGoalRepository savingsGoalRepository;
    // We REMOVED the forum repositories

    @Override
    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToUserDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<TransactionDto> getTransactionsForUser(Long userId) {
        return transactionRepository.findByUserId(userId).stream()
                .map(this::mapToTransactionDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<String> getAllCategories() {
        return transactionRepository.findAllDistinctCategories();
    }

    @Override
    public Map<String, Object> getDashboardSummary() {
        long totalUsers = userRepository.count();
        long totalTransactions = transactionRepository.count();
        // We REMOVED totalForumPosts
        return Map.of(
            "totalUsers", totalUsers,
            "totalTransactions", totalTransactions
        );
    }
    
    @Override
    @Transactional
    public void deleteUserAccount(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // 1. Delete all child records first
        transactionRepository.deleteAllByUserId(userId);
        budgetRepository.deleteAllByUserId(userId);
        savingsGoalRepository.deleteAllByUserId(userId);
        
        // 2. We REMOVED the forum deletion logic
        
        // 3. Finally, delete the user
        userRepository.delete(user);
    }

    // --- Helper Methods ---

    private UserDto mapToUserDto(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        return dto;
    }
    
    // This method is now fixed because Transaction.java has @Data
    private TransactionDto mapToTransactionDto(Transaction transaction) {
        TransactionDto dto = new TransactionDto();
        dto.setId(transaction.getId());
        dto.setType(transaction.getType());
        dto.setAmount(transaction.getAmount());
        dto.setCategory(transaction.getCategory());
        dto.setDescription(transaction.getDescription());
        dto.setDate(transaction.getDate());
        return dto;
    }
}