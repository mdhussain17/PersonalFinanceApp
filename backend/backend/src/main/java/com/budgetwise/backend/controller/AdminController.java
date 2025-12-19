package com.budgetwise.backend.controller;

import com.budgetwise.backend.dto.TransactionDto;
import com.budgetwise.backend.dto.UserDto;
import com.budgetwise.backend.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    /**
     * Admin Feature: Get summary stats for the whole site.
     */
    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getAdminDashboardSummary() {
        return ResponseEntity.ok(adminService.getDashboardSummary());
    }

    /**
     * Admin Feature: Get a list of all users.
     */
    @GetMapping("/users")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    /**
     * Admin Feature: Get all transactions for a *specific* user.
     */
    @GetMapping("/users/{userId}/transactions")
    public ResponseEntity<List<TransactionDto>> getTransactionsForUser(@PathVariable Long userId) {
        return ResponseEntity.ok(adminService.getTransactionsForUser(userId));
    }

    /**
     * Admin Feature: Get a list of all unique categories in use.
     */
    @GetMapping("/categories")
    public ResponseEntity<List<String>> getAllCategories() {
        return ResponseEntity.ok(adminService.getAllCategories());
    }

    /**
     * Admin Feature: Delete a user and all their data.
     */
    @DeleteMapping("/users/{userId}")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable Long userId) {
        adminService.deleteUserAccount(userId);
        return ResponseEntity.ok(Map.of("message", "User and all associated data deleted successfully."));
    }
}