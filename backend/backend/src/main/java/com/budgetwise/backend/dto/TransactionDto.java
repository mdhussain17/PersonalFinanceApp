package com.budgetwise.backend.dto;

import lombok.Data; // <-- 1. ADD THIS IMPORT
import java.time.LocalDate;

@Data // <-- 2. ADD THIS ANNOTATION (if it's missing)
public class TransactionDto {
    private Long id;
    private String type;
    private double amount;
    private String category;
    private String description;
    private LocalDate date;
}