package com.budgetwise.backend.ai.dto;

import lombok.Data;
import java.util.List;

@Data
public class ExpensePredictionDto {
    private List<DataPoint> historicalData;
    
    // --- CHANGE THIS FIELD NAME ---
    private List<DataPoint> predictedData; // Changed from 'predictedTrend' to 'predictedData'
    
    private Double nextMonthPrediction;
}