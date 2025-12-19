package com.budgetwise.backend.service.impl;

import com.budgetwise.backend.dto.SavingsGoalDto;
import com.budgetwise.backend.entity.SavingsGoal;
import com.budgetwise.backend.entity.User;
import com.budgetwise.backend.repository.SavingsGoalRepository;
import com.budgetwise.backend.repository.TransactionRepository;
import com.budgetwise.backend.repository.UserRepository;
import com.budgetwise.backend.service.SavingsGoalService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional; 
import java.util.stream.Collectors;

// --- THIS IS THE FIX ---
// Add this line to tell Eclipse to ignore the "unused" warning
@SuppressWarnings("unused") 
// --- END FIX ---
@Service
@RequiredArgsConstructor
public class SavingsGoalServiceImpl implements SavingsGoalService {
// ... (rest of your file is correct)

    private final UserRepository userRepository;
    private final SavingsGoalRepository savingsGoalRepository;
    private final TransactionRepository transactionRepository;

    @Override
    public SavingsGoalDto createSavingsGoal(String userEmail, SavingsGoalDto dto) {
        User user = findUserByEmail(userEmail);
        SavingsGoal goal = mapToEntity(dto); // Maps name, target, deadline
        goal.setUser(user);
        SavingsGoal savedGoal = savingsGoalRepository.save(goal);
        // Return DTO with calculated progress
        return mapToDtoWithProgress(savedGoal);
    }

    @Override
    public List<SavingsGoalDto> getSavingsGoalsByUser(String userEmail) {
        User user = findUserByEmail(userEmail);

        // Get all goals and map them, calculating progress for each
        return savingsGoalRepository.findByUserId(user.getId())
                .stream()
                .map(this::mapToDtoWithProgress) // Calls the new helper
                .collect(Collectors.toList());
    }

    @Override
    public SavingsGoalDto updateSavingsGoal(String userEmail, Long goalId, SavingsGoalDto dto) {
        User user = findUserByEmail(userEmail);

        SavingsGoal goal = savingsGoalRepository.findByIdAndUserId(goalId, user.getId())
                .orElseThrow(() -> new RuntimeException("Savings goal not found or user not authorized"));

        // We ONLY update the user-editable fields
        goal.setGoalName(dto.getGoalName());
        goal.setTargetAmount(dto.getTargetAmount());
        goal.setDeadline(dto.getDeadline());
        // (We no longer update currentAmount from the DTO)

        SavingsGoal updatedGoal = savingsGoalRepository.save(goal);
        // Return DTO with calculated progress
        return mapToDtoWithProgress(updatedGoal);
    }

    @Override
    public void deleteSavingsGoal(String userEmail, Long goalId) {
        User user = findUserByEmail(userEmail);
        SavingsGoal goal = savingsGoalRepository.findByIdAndUserId(goalId, user.getId())
                .orElseThrow(() -> new RuntimeException("Savings goal not found or user not authorized"));
        savingsGoalRepository.delete(goal);
    }

    // --- Helper Methods ---

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
    }

    /**
     * NEW HELPER: Maps an entity to a DTO and calculates progress
     * by summing SAVINGS transactions.
     */
    private SavingsGoalDto mapToDtoWithProgress(SavingsGoal goal) {

        // 1. The category (e.g., "Vacation") MUST match the goal name
        String matchingCategory = goal.getGoalName();

        // 2. Call the new repository method
        // (This query must exist in TransactionRepository)
        double currentAmount = transactionRepository.findTotalSavingsByCategory(
                goal.getUser().getId(),
                matchingCategory
        );

        // 3. Set all DTO fields
        SavingsGoalDto dto = new SavingsGoalDto();
        dto.setId(goal.getId());
        dto.setGoalName(goal.getGoalName());
        dto.setTargetAmount(goal.getTargetAmount());
        dto.setDeadline(goal.getDeadline());
        dto.setCurrentAmount(currentAmount); // The calculated value

        // 4. Use Optional.ofNullable for a null-safe calculation
        double target = Optional.ofNullable(goal.getTargetAmount()).orElse(0.0);
        dto.setRemainingAmount(target - currentAmount);

        return dto;
    }

    /**
     * Maps a DTO to an entity (basic fields only).
     */
    private SavingsGoal mapToEntity(SavingsGoalDto dto) {
        SavingsGoal goal = new SavingsGoal();
        goal.setGoalName(dto.getGoalName());
        goal.setTargetAmount(dto.getTargetAmount());
        goal.setDeadline(dto.getDeadline());
        return goal;
    }
}