package com.budgetwise.backend.controller;

import com.budgetwise.backend.ai.dto.ExpensePredictionDto;
import com.budgetwise.backend.dto.SavingsGoalDto;
import com.budgetwise.backend.dto.TransactionDto;
import com.budgetwise.backend.dto.TransactionSummaryDto;
import com.budgetwise.backend.service.GoogleGeminiService;
import com.budgetwise.backend.service.SavingsGoalService;
import com.budgetwise.backend.service.TransactionService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AIController {

    private final GoogleGeminiService geminiService;
    private final TransactionService transactionService;
    private final SavingsGoalService savingsGoalService;
    private final ObjectMapper objectMapper;

    // --- Original AI Endpoints ---

    @GetMapping("/insights")
    public ResponseEntity<Map<String, String>> getInsights(Principal principal) {
        var summary = transactionService.getTransactionSummary(principal.getName());
        String insights = geminiService.generateMonthlyInsights(summary);
        return ResponseEntity.ok(Map.of("insights", insights));
    }

    @GetMapping("/forecast")
    public ResponseEntity<Map<String, String>> getForecast(Principal principal) {
        List<TransactionDto> history = transactionService.getTransactionsByUser(principal.getName());
        String historyJson = convertToJson(history);
        String forecast = geminiService.generatePredictionAndAlerts(historyJson);
        return ResponseEntity.ok(Map.of("forecast", forecast));
    }

    @PostMapping("/categorize")
    public ResponseEntity<Map<String, String>> categorize(@RequestBody Map<String, String> request) {
        String description = request.get("description");
        List<String> categories = List.of("Food", "Rent", "Transport", "Entertainment", "Utilities", "Savings - Vacation", "Savings - School Fund");
        String category = geminiService.getCategoryForTransaction(description, categories);
        return ResponseEntity.ok(Map.of("category", category));
    }

    // --- New Prediction Endpoints ---

    @GetMapping("/expense-trend")
    public ResponseEntity<ExpensePredictionDto> getExpenseTrend(Principal principal) {
        ExpensePredictionDto prediction = geminiService.getExpensePrediction(principal.getName());
        return ResponseEntity.ok(prediction);
    }

    @GetMapping("/next-month-prediction-chat")
    public ResponseEntity<Map<String, String>> getNextMonthPredictionChat(Principal principal) {
        String predictionChat = geminiService.generateNextMonthExpensePrediction(principal.getName());
        return ResponseEntity.ok(Map.of("predictionMessage", predictionChat));
    }

    // --- Chatbot Endpoints ---

    @PostMapping("/chat")
    public ResponseEntity<Map<String, String>> handleChat(
            @RequestBody Map<String, String> request, Principal principal) {
        
        String question = request.get("question");
        String context = request.get("context");
        String userEmail = principal.getName();
        
        String prompt;
        
        // Explicitly use the type to fix IDE warning
        TransactionSummaryDto summary = transactionService.getTransactionSummary(userEmail);
        var transactions = transactionService.getTransactionsByUser(userEmail);

        String summaryJson = convertToJson(summary);
        String transactionsJson = convertToJson(transactions);

        if ("savings".equalsIgnoreCase(context)) {
            var goals = savingsGoalService.getSavingsGoalsByUser(userEmail);
            String goalsJson = convertToJson(goals);
            prompt = String.format(
                "You are a savings coach. A user asks: '%s'\n" +
                "Here is their financial summary: %s\n" +
                "Here are their savings goals: %s\n" +
                "Answer the question directly, using their data for context. Keep it under 150 words.",
                question, summaryJson, goalsJson
            );
        } else { 
            prompt = String.format(
                "You are a financial analyst. A user asks: '%s'\n" +
                "Here is their financial summary: %s\n" +
                "Here are their recent transactions: %s\n" +
                "Answer the question directly, using their data for context. Keep it under 150 words.",
                question, summaryJson, transactionsJson
            );
        }

        String response = geminiService.generateChatResponse(prompt);
        return ResponseEntity.ok(Map.of("response", response));
    }

    @GetMapping("/spending-breakdown")
    public ResponseEntity<Map<String, String>> getSpendingBreakdown(Principal principal) {
        List<TransactionDto> transactions = transactionService.getTransactionsByUser(principal.getName());
        String response = geminiService.generateSpendingBreakdown(transactions);
        return ResponseEntity.ok(Map.of("breakdown", response));
    }

    @GetMapping("/saving-tips/{goalId}")
    public ResponseEntity<Map<String, String>> getSavingTips(
            @PathVariable Long goalId, Principal principal) {
        
        SavingsGoalDto goal = savingsGoalService.getSavingsGoalsByUser(principal.getName())
                .stream()
                .filter(g -> g.getId().equals(goalId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Savings goal not found or not authorized"));

        String response = geminiService.generateSavingTipsForGoal(goal);
        return ResponseEntity.ok(Map.of("tips", response));
    }

    @GetMapping("/transaction-details")
    public ResponseEntity<Map<String, String>> getTransactionDetails(Principal principal) {
        var transactions = transactionService.getTransactionsByUser(principal.getName());
        String response = geminiService.generateTransactionDetails(transactions);
        return ResponseEntity.ok(Map.of("details", response));
    }

    @GetMapping("/personalized-insights")
    public ResponseEntity<Map<String, String>> getPersonalizedInsights(Principal principal) {
        var summary = transactionService.getTransactionSummary(principal.getName());
        var transactions = transactionService.getTransactionsByUser(principal.getName());
        String response = geminiService.generatePersonalizedInsights(summary, transactions);
        return ResponseEntity.ok(Map.of("insights", response));
    }

    @GetMapping("/goal-tracking")
    public ResponseEntity<Map<String, String>> getGoalTracking(Principal principal) {
        var summary = transactionService.getTransactionSummary(principal.getName());
        var goals = savingsGoalService.getSavingsGoalsByUser(principal.getName());
        String response = geminiService.generateGoalTrackingAnalysis(goals, summary);
        return ResponseEntity.ok(Map.of("tracking", response));
    }

    private String convertToJson(Object object) {
        try {
            return objectMapper.writeValueAsString(object);
        } catch (Exception e) {
            return "{\"error\": \"Could not process data\"}";
        }
    }
}