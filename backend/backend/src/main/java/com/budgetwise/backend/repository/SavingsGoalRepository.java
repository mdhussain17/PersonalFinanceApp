package com.budgetwise.backend.repository;

import com.budgetwise.backend.entity.SavingsGoal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional; // <-- 1. ADD THIS IMPORT

import java.util.List;
import java.util.Optional;

@Repository
public interface SavingsGoalRepository extends JpaRepository<SavingsGoal, Long> {

    // This supports your getSavingsGoalsByUser() service method
    // It finds all goals associated with a specific user's ID
    List<SavingsGoal> findByUserId(Long userId);

    // This supports your updateSavingsGoal() and deleteSavingsGoal() service methods
    // It finds a single goal by its ID *and* ensures it belongs to the correct user
    Optional<SavingsGoal> findByIdAndUserId(Long goalId, Long userId);

    // --- 2. ADD THIS METHOD ---
    // This is required for your AdminService to delete a user
    @Transactional
    void deleteAllByUserId(Long userId);
}