package com.budgetwise.backend.dto;
import lombok.AllArgsConstructor;
import lombok.Data;
@Data @AllArgsConstructor
public class CategorySpendingDto {
    private String category;
    private Double totalAmount;
}