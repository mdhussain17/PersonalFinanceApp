package com.budgetwise.backend.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class BudgetDto {
    private Long id;
    private String category;
    private double amount; 
    private LocalDate startDate;
    private LocalDate endDate;
    
   
    private double spent;
    private double remaining;
}