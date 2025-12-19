package com.budgetwise.backend.repository;

import com.budgetwise.backend.entity.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional; // <-- 1. ADD THIS IMPORT
import java.util.List;
import java.util.Optional; 

public interface BudgetRepository extends JpaRepository<Budget, Long> {

    List<Budget> findByUserId(Long userId);

    // Finds a budget by its ID *and* the user's ID
    Optional<Budget> findByIdAndUserId(Long id, Long userId); 
    
    // --- 2. ADD THIS METHOD ---
    // This is required for your AdminService to delete a user
    @Transactional
    void deleteAllByUserId(Long userId);
}