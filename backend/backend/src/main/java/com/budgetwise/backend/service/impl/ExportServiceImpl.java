package com.budgetwise.backend.service.impl;

// We no longer need TransactionService, so we can remove it
import com.budgetwise.backend.entity.Transaction;
import com.budgetwise.backend.entity.User;
import com.budgetwise.backend.repository.TransactionRepository;
import com.budgetwise.backend.repository.UserRepository;
import com.budgetwise.backend.service.ExportService;
import jakarta.servlet.http.HttpServletResponse; 
import lombok.RequiredArgsConstructor;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

// --- iText PDF Imports ---
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.itextpdf.kernel.colors.ColorConstants;
// --- End iText Imports ---

import java.io.IOException;
import java.io.Writer;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExportServiceImpl implements ExportService {

    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    // We REMOVED the TransactionService to fix the bug

    @Override
    public void exportTransactionsToCsv(String userEmail, LocalDate startDate, LocalDate endDate, Writer writer) throws IOException {
        User user = findUserByEmail(userEmail);

        List<Transaction> transactions = transactionRepository.findByUserIdAndDateBetweenOrderByDateDesc(
                user.getId(), startDate, endDate
        );

        String[] headers = {"Date", "Type", "Category", "Description", "Amount"};

        // --- THIS IS THE FIX ---
        // We use the new .builder() method to set the header
        CSVFormat csvFormat = CSVFormat.DEFAULT.builder()
                .setHeader(headers)
                .build();
        
        try (CSVPrinter csvPrinter = new CSVPrinter(writer, csvFormat)) {
        // --- END FIX ---

            for (Transaction tx : transactions) {
                csvPrinter.printRecord(
                    tx.getDate(),
                    tx.getType(),
                    tx.getCategory(),
                    tx.getDescription(),
                    tx.getAmount()
                );
            }
        }
    }

    // ---
    // --- THIS IS THE FIXED PDF EXPORT METHOD ---
    // ---
    @Override
    public void exportTransactionsToPdf(String userEmail, LocalDate startDate, LocalDate endDate, HttpServletResponse response) throws IOException {
        User user = findUserByEmail(userEmail);

        // 1. Fetch the transactions *only for the selected date range*
        List<Transaction> transactions = transactionRepository.findByUserIdAndDateBetweenOrderByDateDesc(
                user.getId(), startDate, endDate
        );

        // 2. --- THIS IS THE FIX ---
        //    Calculate totals *manually* from the list we just fetched.
        double totalIncome = 0.0;
        double totalExpenses = 0.0;
        double totalSavings = 0.0;

        for (Transaction tx : transactions) {
            switch (tx.getType()) {
                case "INCOME":
                    totalIncome += tx.getAmount();
                    break;
                case "EXPENSE":
                    totalExpenses += tx.getAmount();
                    break;
                case "SAVINGS":
                    totalSavings += tx.getAmount();
                    break;
            }
        }
        // Use the correct formula: (Income - Expenses) - Savings
        double availableBalance = totalIncome - totalExpenses - totalSavings;

        // 3. Initialize the PDF document
        PdfWriter pdfWriter = new PdfWriter(response.getOutputStream());
        PdfDocument pdfDocument = new PdfDocument(pdfWriter);
        Document document = new Document(pdfDocument);

        // 4. Define a date formatter
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMMM d, yyyy");

        // 5. --- Add Title and Headers ---
        document.add(new Paragraph("BudgetWise Financial Report")
                .setBold().setFontSize(20).setTextAlignment(TextAlignment.CENTER));
        
        document.add(new Paragraph("User: " + user.getEmail())
                .setFontSize(12).setTextAlignment(TextAlignment.LEFT));

        document.add(new Paragraph("Report Date Range: " + startDate.format(formatter) + " to " + endDate.format(formatter))
                .setFontSize(12).setTextAlignment(TextAlignment.LEFT));
        
        document.add(new Paragraph("\n")); // Add a space

        // 6. --- Add High-Level Summary (using our new correct totals) ---
        document.add(new Paragraph("Financial Summary for Selected Period")
                .setBold().setFontSize(16));
        
        // Use the new, correct variables
        document.add(new Paragraph("Total Income: ₹" + String.format("%.2f", totalIncome)));
        document.add(new Paragraph("Total Expenses: ₹" + String.format("%.2f", totalExpenses)));
        document.add(new Paragraph("Total Saved: ₹" + String.format("%.2f", totalSavings)));
        
        Paragraph balancePara = new Paragraph("Available Balance: ₹" + String.format("%.2f", availableBalance))
                .setBold();

        // Set color based on value
        if (availableBalance < 0) {
            balancePara.setFontColor(ColorConstants.RED);
        } else {
            balancePara.setFontColor(ColorConstants.BLUE);
        }
        document.add(balancePara);
        
        document.add(new Paragraph("\n"));

        // 7. --- Add Detailed Transaction Table (this was already correct) ---
        document.add(new Paragraph("Detailed Transactions")
                .setBold().setFontSize(16));
        
        Table table = new Table(UnitValue.createPercentArray(new float[]{3, 2, 3, 5, 3}));
        table.setWidth(UnitValue.createPercentValue(100));

        // Add Table Headers
        table.addHeaderCell(new Cell().add(new Paragraph("Date").setBold()));
        table.addHeaderCell(new Cell().add(new Paragraph("Type").setBold()));
        table.addHeaderCell(new Cell().add(new Paragraph("Category").setBold()));
        table.addHeaderCell(new Cell().add(new Paragraph("Description").setBold()));
        table.addHeaderCell(new Cell().add(new Paragraph("Amount (₹)").setBold()));

        // Add Table Rows
        for (Transaction tx : transactions) {
            table.addCell(new Cell().add(new Paragraph(tx.getDate().toString())));
            table.addCell(new Cell().add(new Paragraph(tx.getType())));
            table.addCell(new Cell().add(new Paragraph(tx.getCategory())));
            table.addCell(new Cell().add(new Paragraph(tx.getDescription())));
            
            Cell amountCell = new Cell().add(new Paragraph(String.format("%.2f", tx.getAmount())));
            if ("INCOME".equals(tx.getType())) {
                amountCell.setFontColor(ColorConstants.GREEN);
            } else if ("EXPENSE".equals(tx.getType())) {
                amountCell.setFontColor(ColorConstants.RED);
            } else if (tx.getAmount() < 0) { // Handle savings withdrawal
                amountCell.setFontColor(ColorConstants.ORANGE);
            }
            table.addCell(amountCell);
        }

        document.add(table);
        
        // 8. Close the document
        document.close();
    }
    
    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }
}