package com.budgetwise.backend.entity;

import jakarta.persistence.*; // Your main import
import java.time.LocalDate;  // <-- 1. Added missing import for LocalDate
import lombok.Data;          // <-- 2. Added missing import for @Data

@Entity
@Table(name = "savings_goals") // This matches your schema diagram [cite: 235]
@Data // From Lombok, for getters/setters/constructors
public class SavingsGoal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // --- 3. Added fetch = FetchType.LAZY for performance ---
    @ManyToOne(fetch = FetchType.LAZY) 
    @JoinColumn(name = "user_id", nullable = false) // Matches schema [cite: 235]
    private User user;

    // --- 4. Added @Column for explicit mapping ---
    @Column(name = "goal_name") // Matches schema [cite: 237]
    private String goalName;

    @Column(name = "target_amount") // Matches schema [cite: 235]
    private Double targetAmount;

    @Column(name = "current_amount") // Matches schema [cite: 238]
    private Double currentAmount;

    @Column(name = "deadline") // Matches schema [cite: 235]
    private LocalDate deadline; // This correctly uses LocalDate
}