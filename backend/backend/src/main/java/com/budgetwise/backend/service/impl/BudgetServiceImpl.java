package com.budgetwise.backend.service.impl;

import com.budgetwise.backend.dto.BudgetDto;
import com.budgetwise.backend.entity.Budget;
import com.budgetwise.backend.entity.User;
import com.budgetwise.backend.repository.BudgetRepository;
import com.budgetwise.backend.repository.TransactionRepository; // 1. Import TransactionRepository
import com.budgetwise.backend.repository.UserRepository;
import com.budgetwise.backend.service.BudgetService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.time.LocalDate; // 2. Import LocalDate
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor // This handles all final fields
public class BudgetServiceImpl implements BudgetService {

    private final UserRepository userRepository;
    private final BudgetRepository budgetRepository;
    private final TransactionRepository transactionRepository; // 3. Inject TransactionRepository

    /**
     * Creates a new budget for the user.
     */
    @Override
    public BudgetDto createBudget(String userEmail, BudgetDto budgetDto) {
        User user = findUserByEmail(userEmail); // Changed to findUserByEmail
        Budget budget = mapToEntity(budgetDto);
        budget.setUser(user);

        // Set default dates if not provided (e.g., current month)
        if (budget.getStartDate() == null) {
            budget.setStartDate(LocalDate.now().withDayOfMonth(1));
        }
        if (budget.getEndDate() == null) {
            budget.setEndDate(LocalDate.now().withDayOfMonth(LocalDate.now().lengthOfMonth()));
        }

        Budget savedBudget = budgetRepository.save(budget);
        return mapToDtoWithSpent(savedBudget); // 4. Return DTO with calculated fields
    }

    /**
     * Retrieves all budgets for the user, with spent/remaining amounts calculated.
     */
    @Override
    public List<BudgetDto> getBudgetsByUser(String userEmail) {
        User user = findUserByEmail(userEmail); // Changed to findUserByEmail
        List<Budget> budgets = budgetRepository.findByUserId(user.getId());
        
        // 5. Map each Budget to a DTO, calculating spent/remaining
        return budgets.stream()
                .map(this::mapToDtoWithSpent) // Use the new helper
                .collect(Collectors.toList());
    }

    /**
     * Updates an existing budget.
     */
    @Override
    public BudgetDto updateBudget(String userEmail, Long budgetId, BudgetDto budgetDto) {
        User user = findUserByEmail(userEmail); // Changed to findUserByEmail
        Budget budget = budgetRepository.findByIdAndUserId(budgetId, user.getId())
                 .orElseThrow(() -> new RuntimeException("Budget not found or user not authorized"));

        budget.setCategory(budgetDto.getCategory());
        budget.setAmount(budgetDto.getAmount());
        budget.setStartDate(budgetDto.getStartDate());
        budget.setEndDate(budgetDto.getEndDate());
        
        Budget updatedBudget = budgetRepository.save(budget);
        return mapToDtoWithSpent(updatedBudget); // 6. Return DTO with calculated fields
    }

    /**
     * Deletes a budget.
     */
    @Override
    public void deleteBudget(String userEmail, Long budgetId) {
        User user = findUserByEmail(userEmail); // Changed to findUserByEmail
        Budget budget = budgetRepository.findByIdAndUserId(budgetId, user.getId())
                 .orElseThrow(() -> new RuntimeException("Budget not found or user not authorized"));
        
        budgetRepository.delete(budget);
    }

    // --- Helper Methods ---

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
    }

    /**
     * Maps a Budget entity to a basic BudgetDto (without calculations).
     */
    private BudgetDto mapToDto(Budget budget) {
        BudgetDto dto = new BudgetDto();
        dto.setId(budget.getId());
        dto.setCategory(budget.getCategory());
        dto.setAmount(budget.getAmount()); // This is the "Planned" amount
        dto.setStartDate(budget.getStartDate());
        dto.setEndDate(budget.getEndDate());
        return dto;
    }

    /**
     * Maps a BudgetDto to a Budget entity.
     */
    private Budget mapToEntity(BudgetDto dto) {
        Budget budget = new Budget();
        budget.setCategory(dto.getCategory());
        budget.setAmount(dto.getAmount());
        budget.setStartDate(dto.getStartDate());
        budget.setEndDate(dto.getEndDate());
        return budget;
    }

    /**
     * 7. NEW HELPER METHOD
     * Maps a Budget entity to a BudgetDto AND calculates the spent/remaining amounts.
     * This is the method that fixes your problem.
     */
    private BudgetDto mapToDtoWithSpent(Budget budget) {
        // 1. Get the basic DTO
        BudgetDto dto = mapToDto(budget);

        // 2. Define the date range for the query
        LocalDate startDate = (budget.getStartDate() != null) ? budget.getStartDate() : LocalDate.now().withDayOfMonth(1);
        LocalDate endDate = (budget.getEndDate() != null) ? budget.getEndDate() : LocalDate.now().withDayOfMonth(LocalDate.now().lengthOfMonth());

        // 3. Call the repository to find the sum of transactions
        //    (This requires the findSpentAmountByCategoryAndDate method in TransactionRepository)
        double spent = transactionRepository.findSpentAmountByCategoryAndDate(
                budget.getUser().getId(),
                budget.getCategory(),
                startDate,
                endDate
        );

        // 4. Set the calculated values on the DTO
        double planned = dto.getAmount();
        double remaining = planned - spent;
        
        // These fields must exist in your BudgetDto.java
        dto.setSpent(spent);
        dto.setRemaining(remaining);

        return dto;
    }
}