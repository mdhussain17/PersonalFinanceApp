package com.budgetwise.backend.entity;

import jakarta.persistence.*;
import lombok.Data; // <-- 1. ADD THIS IMPORT
import java.time.LocalDate;

@Data // <-- 2. ADD THIS ANNOTATION
@Entity
@Table(name = "transactions") // Or whatever your table name is
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String type; // INCOME, EXPENSE, SAVINGS
    private double amount;
    private String category;
    private String description;
    private LocalDate date;
}