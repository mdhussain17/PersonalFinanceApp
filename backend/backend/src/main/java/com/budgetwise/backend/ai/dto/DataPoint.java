package com.budgetwise.backend.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DataPoint {
    private String label;
    private Double value; // Ensure this field is named 'value'
}