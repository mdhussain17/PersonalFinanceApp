package com.budgetwise.backend.service.impl;

import com.budgetwise.backend.ai.dto.DataPoint;
import com.budgetwise.backend.ai.dto.ExpensePredictionDto;
import com.budgetwise.backend.ai.dto.GeminiRequest;
import com.budgetwise.backend.ai.dto.GeminiResponse;
import com.budgetwise.backend.dto.SavingsGoalDto;
import com.budgetwise.backend.dto.TransactionDto;
import com.budgetwise.backend.dto.TransactionSummaryDto;
import com.budgetwise.backend.entity.Transaction;
import com.budgetwise.backend.entity.User;
import com.budgetwise.backend.repository.TransactionRepository;
import com.budgetwise.backend.repository.UserRepository;
import com.budgetwise.backend.service.GoogleGeminiService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class GoogleGeminiServiceImpl implements GoogleGeminiService {

    private final WebClient geminiWebClient;
    private final ObjectMapper objectMapper;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    // ---
    // --- 1. ORIGINAL AI FEATURES ---
    // ---

    @Override
    public String generateMonthlyInsights(TransactionSummaryDto summary) {
        String summaryJson = convertToJson(summary);
        String prompt = "You are a friendly financial advisor. Based on this monthly summary (JSON): \n"
                + summaryJson + "\n"
                + "Provide 3 actionable saving tips and one insight about the spending-to-income ratio. Keep it under 150 words.";
        return callGeminiApi(prompt);
    }

    @Override
    public String generatePredictionAndAlerts(String transactionHistoryJson) {
        String prompt = "Financial analyst task. Analyze these transactions (JSON): \n"
                + transactionHistoryJson + "\n"
                + "1. Predict next month's total spending (single number).\n"
                + "2. List any anomalies/alerts.\n"
                + "Keep it under 150 words.";
        return callGeminiApi(prompt);
    }

    @Override
    public String getCategoryForTransaction(String description, List<String> categories) {
        String prompt = "Categorize this transaction description: \"" + description + "\"\n"
                + "Choose ONLY from: " + String.join(", ", categories) + "\n"
                + "Category:";
        String category = callGeminiApi(prompt);
        return category.trim().replaceAll("[^a-zA-Z0-9 -]", "");
    }

    // ---
    // --- 2. CHATBOT FEATURES (6 Methods) ---
    // ---

    @Override
    public String generateChatResponse(String prompt) {
        return callGeminiApi(prompt);
    }

    @Override
    public String generateSpendingBreakdown(List<TransactionDto> transactions) {
        String data = convertToJson(transactions);
        String prompt = String.format(
            "Analyze this spending data: %s\nProvide a 3-bullet breakdown of spending habits by category. Max 100 words.", data);
        return callGeminiApi(prompt);
    }

    @Override
    public String generateSavingTipsForGoal(SavingsGoalDto goal) {
        String data = convertToJson(goal);
        String prompt = String.format(
            "Savings coach task. User goal: %s\nProvide 2-3 specific tips to reach this faster. Max 100 words.", data);
        return callGeminiApi(prompt);
    }

    @Override
    public String generateTransactionDetails(List<TransactionDto> transactions) {
        String data = convertToJson(transactions);
        String prompt = String.format(
            "Analyze transactions: %s\nIdentify the largest expense and most frequent category. Max 2 sentences.", data);
        return callGeminiApi(prompt);
    }

    @Override
    public String generatePersonalizedInsights(TransactionSummaryDto summary, List<TransactionDto> transactions) {
        String sData = convertToJson(summary);
        String tData = convertToJson(transactions);
        String prompt = String.format(
            "Summary: %s\nTransactions: %s\nProvide one personalized insight and one improvement tip. Max 150 words.", sData, tData);
        return callGeminiApi(prompt);
    }

    @Override
    public String generateGoalTrackingAnalysis(List<SavingsGoalDto> goals, TransactionSummaryDto summary) {
        String gData = convertToJson(goals);
        String sData = convertToJson(summary);
        String prompt = String.format(
            "Goals: %s\nSummary: %s\nAnalyze savings progress and suggest a priority. Max 100 words.", gData, sData);
        return callGeminiApi(prompt);
    }

    // ---
    // --- 3. NEW LOGIC: PREDICTION CHART & CHAT ---
    // ---

    @Override
    public ExpensePredictionDto getExpensePrediction(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        LocalDate now = LocalDate.now();
        YearMonth currentMonth = YearMonth.now();

        // 1. Get THIS MONTH's transactions from the database
        LocalDate startOfMonth = now.withDayOfMonth(1);
        LocalDate endOfMonth = now.withDayOfMonth(now.lengthOfMonth());

        List<Transaction> currentMonthTransactions = transactionRepository
                .findByUserIdAndDateBetweenOrderByDateDesc(user.getId(), startOfMonth, endOfMonth)
                .stream()
                .filter(t -> "EXPENSE".equalsIgnoreCase(t.getType()))
                .collect(Collectors.toList());

        // 2. Calculate THIS MONTH's total expenses
        double currentMonthTotal = currentMonthTransactions.stream()
                .mapToDouble(Transaction::getAmount)
                .sum();

        // 3. Calculate DAILY AVERAGE for current month
        int daysPassed = now.getDayOfMonth();
        if (daysPassed == 0) daysPassed = 1; // Avoid divide by zero safety check

        double dailyAverage = currentMonthTotal / daysPassed;

        // 4. Predict next month based on daily average * 30 days
        double predictedNextMonth = dailyAverage * 30;

        // 5. Create historical data (current month only)
        List<DataPoint> historicalData = new ArrayList<>();
        historicalData.add(new DataPoint(
                currentMonth.format(DateTimeFormatter.ofPattern("MMM")), // e.g. "Nov"
                currentMonthTotal
        ));

        // 6. Create predicted data (next month)
        List<DataPoint> predictedData = new ArrayList<>();
        predictedData.add(new DataPoint(
                currentMonth.plusMonths(1).format(DateTimeFormatter.ofPattern("MMM")), // e.g. "Dec"
                predictedNextMonth
        ));

        // 7. Build and return the DTO
        ExpensePredictionDto dto = new ExpensePredictionDto();
        dto.setHistoricalData(historicalData);
        dto.setPredictedData(predictedData);
        dto.setNextMonthPrediction(predictedNextMonth); // Ensure this field exists in your DTO

        return dto;
    }

    @Override
    public String generateNextMonthExpensePrediction(String userEmail) {
        // Re-use the logic above to get the number
        ExpensePredictionDto predictionData = getExpensePrediction(userEmail);
        
        double predictedAmount = 0.0;
        if (predictionData != null && predictionData.getNextMonthPrediction() != null) {
            predictedAmount = predictionData.getNextMonthPrediction();
        }

        String prompt = String.format(
            "Based on the user's current daily spending average, the predicted expense for next month is approx %.2f. " +
            "Write a short, encouraging chat message (under 100 words) about this. " +
            "If the prediction is high, suggest cutting back. If low, say great job.",
            predictedAmount
        );
        return callGeminiApi(prompt);
    }


    // --- Helper Methods ---

    private String callGeminiApi(String prompt) {
        GeminiRequest request = new GeminiRequest(prompt);
        try {
            GeminiResponse response = geminiWebClient.post()
                    .body(Mono.just(request), GeminiRequest.class)
                    .retrieve()
                    .bodyToMono(GeminiResponse.class)
                    .block(); 

            if (response != null) return response.getFirstText();
        } catch (Exception e) {
            log.error("Gemini API Error: {}", e.getMessage());
            return "Error: AI service unavailable.";
        }
        return "Error: No response.";
    }

    private String convertToJson(Object object) {
        try {
            return objectMapper.writeValueAsString(object);
        } catch (JsonProcessingException e) {
            log.error("JSON Error: {}", e.getMessage());
            return "{}";
        }
    }
}