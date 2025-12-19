package com.budgetwise.backend.controller;

import com.budgetwise.backend.dto.SavingsGoalDto;
import com.budgetwise.backend.service.SavingsGoalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal; // Used to get the logged-in user
import java.util.List;

@RestController
@RequestMapping("/api/savings-goals")
@RequiredArgsConstructor
public class SavingsGoalController {

    private final SavingsGoalService savingsGoalService;

    // POST /api/savings-goals
    @PostMapping
    public ResponseEntity<SavingsGoalDto> createSavingsGoal(
            @RequestBody SavingsGoalDto dto, Principal principal) {
        
        SavingsGoalDto createdGoal = savingsGoalService.createSavingsGoal(principal.getName(), dto);
        return new ResponseEntity<>(createdGoal, HttpStatus.CREATED);
    }

    // GET /api/savings-goals
    @GetMapping
    public ResponseEntity<List<SavingsGoalDto>> getSavingsGoalsByUser(Principal principal) {
        List<SavingsGoalDto> goals = savingsGoalService.getSavingsGoalsByUser(principal.getName());
        return ResponseEntity.ok(goals);
    }

    // PUT /api/savings-goals/{id}
    // This is the endpoint your "Update Goal" button needs to call
    @PutMapping("/{id}")
    public ResponseEntity<SavingsGoalDto> updateSavingsGoal(
            @PathVariable("id") Long goalId,
            @RequestBody SavingsGoalDto dto,
            Principal principal) {
        
        SavingsGoalDto updatedGoal = savingsGoalService.updateSavingsGoal(principal.getName(), goalId, dto);
        return ResponseEntity.ok(updatedGoal);
    }

    // DELETE /api/savings-goals/{id}
    // This is the endpoint your "Delete Goal" button needs to call
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteSavingsGoal(
            @PathVariable("id") Long goalId,
            Principal principal) {
        
        savingsGoalService.deleteSavingsGoal(principal.getName(), goalId);
        return ResponseEntity.ok("Savings goal deleted successfully.");
    }
}