package com.budgetwise.backend.controller;

import com.budgetwise.backend.service.ExportService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.security.Principal;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/export")
@RequiredArgsConstructor
public class ExportController {

    private final ExportService exportService;

    /**
     * Exports user transactions to a CSV file.
     * Example URL: /api/export/csv?startDate=2025-01-01&endDate=2025-01-31
     */
    @GetMapping("/csv")
    public void exportTransactionsToCsv(
            Principal principal,
            @RequestParam("startDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam("endDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            HttpServletResponse response) throws IOException {

        response.setContentType("text/csv");
        response.setHeader("Content-Disposition", "attachment; filename=\"BudgetWise_Transactions.csv\"");

        exportService.exportTransactionsToCsv(
            principal.getName(), 
            startDate, 
            endDate, 
            response.getWriter()
        );
    }

    /**
     * --- ADD THIS NEW ENDPOINT ---
     * Exports a financial report to a PDF file.
     * Example URL: /api/export/pdf?startDate=2025-01-01&endDate=2025-01-31
     */
    @GetMapping("/pdf")
    public void exportTransactionsToPdf(
            Principal principal,
            @RequestParam("startDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam("endDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            HttpServletResponse response) throws IOException {
        
        // 1. Set HTTP headers for a PDF file
        response.setContentType("application/pdf");
        response.setHeader("Content-Disposition", "attachment; filename=\"BudgetWise_Report.pdf\"");

        // 2. Call the service to write the PDF data directly to the response
        exportService.exportTransactionsToPdf(
            principal.getName(),
            startDate,
            endDate,
            response
        );
    }
}