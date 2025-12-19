package com.budgetwise.backend.repository;

import com.budgetwise.backend.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findByUserId(Long userId);

    // --- Dashboard Summary Queries ---

    @Query("SELECT COALESCE(SUM(t.amount), 0.0) FROM Transaction t WHERE t.user.id = :userId AND t.type = 'INCOME'")
    double getTotalIncomeByUserId(@Param("userId") Long userId);

    @Query(
        "SELECT COALESCE(SUM(t.amount), 0.0) FROM Transaction t WHERE t.user.id = :userId AND t.type = 'EXPENSE'")
    double getTotalExpensesByUserId(@Param("userId") Long userId);

    @Query("SELECT COALESCE(SUM(t.amount), 0.0) FROM Transaction t WHERE t.user.id = :userId AND t.type = 'SAVINGS'")
    double getTotalSavingsByUserId(@Param("userId") Long userId);


    // --- Module-Specific Queries ---

    @Query("SELECT COALESCE(SUM(t.amount), 0.0) FROM Transaction t WHERE t.user.id = :userId AND t.category = :category AND t.date BETWEEN :startDate AND :endDate AND t.type = 'EXPENSE'")
    double findSpentAmountByCategoryAndDate(
            @Param("userId") Long userId,
            @Param("category") String category,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query("SELECT COALESCE(SUM(t.amount), 0.0) FROM Transaction t WHERE t.user.id = :userId AND t.category = :category AND t.type = 'SAVINGS'")
    double findTotalSavingsByCategory(
            @Param("userId") Long userId,
            @Param("category") String category
    );

    // --- Admin Portal Query ---

    @Query("SELECT DISTINCT t.category FROM Transaction t ORDER BY t.category ASC")
    List<String> findAllDistinctCategories();


    // --- ***NEW*** Export Feature Query ---

    /**
     * Finds all transactions for a user within a specific date range, ordered by date.
     * This is used for the CSV/PDF export.
     */
    List<Transaction> findByUserIdAndDateBetweenOrderByDateDesc(Long userId, LocalDate startDate, LocalDate endDate);


    // --- Delete User Query ---
    @Transactional
    void deleteAllByUserId(Long userId);
}