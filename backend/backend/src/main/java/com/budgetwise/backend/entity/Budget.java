package com.budgetwise.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "budgets")
@Data
public class Budget {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne @JoinColumn(name = "user_id", nullable = false)
    private User user;
    private String category;
    private Double amount;
    private LocalDate startDate;
    private LocalDate endDate;
}