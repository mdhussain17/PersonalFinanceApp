package com.budgetwise.backend.controller;

import com.budgetwise.backend.dto.BudgetDto;
import com.budgetwise.backend.service.BudgetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
public class BudgetController {
    private final BudgetService budgetService;

    @PostMapping
    public ResponseEntity<BudgetDto> createBudget(Authentication auth, @RequestBody BudgetDto dto) {
        return new ResponseEntity<>(budgetService.createBudget(auth.getName(), dto), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<BudgetDto>> getBudgets(Authentication auth) {
        return ResponseEntity.ok(budgetService.getBudgetsByUser(auth.getName()));
    }

    @PutMapping("/{id}") // Correctly defines the path variable 'id'
    public ResponseEntity<BudgetDto> updateBudget(Authentication auth, @PathVariable Long id, @RequestBody BudgetDto dto) {
        BudgetDto updatedBudget = budgetService.updateBudget(auth.getName(), id, dto);
        return ResponseEntity.ok(updatedBudget);
    }

    @DeleteMapping("/{id}") // Correctly defines the path variable 'id'
    public ResponseEntity<String> deleteBudget(Authentication auth, @PathVariable Long id) {
        budgetService.deleteBudget(auth.getName(), id);
        return ResponseEntity.ok("Budget deleted successfully.");
    }
}