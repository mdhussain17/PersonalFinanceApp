package com.budgetwise.backend.service;

import jakarta.servlet.http.HttpServletResponse; // <-- ADD THIS IMPORT
import java.io.IOException;
import java.io.Writer;
import java.time.LocalDate;

public interface ExportService {
    
    /**
     * Writes all transactions for a user within a date range to a CSV file.
     */
    void exportTransactionsToCsv(String userEmail, LocalDate startDate, LocalDate endDate, Writer writer) throws IOException;
    
    /**
     * --- ADD THIS NEW METHOD ---
     * Creates and writes a PDF report to the HTTP response.
     */
    void exportTransactionsToPdf(String userEmail, LocalDate startDate, LocalDate endDate, HttpServletResponse response) throws IOException;
}