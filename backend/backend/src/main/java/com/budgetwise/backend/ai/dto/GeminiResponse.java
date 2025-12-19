package com.budgetwise.backend.ai.dto;

import lombok.AllArgsConstructor; // <-- ADD THIS
import lombok.Data;
import lombok.NoArgsConstructor; // <-- ADD THIS
import java.util.List;

@Data
@NoArgsConstructor // <-- ADD THIS
public class GeminiResponse {
    private List<Candidate> candidates;

    // Helper method to get the plain text response
    public String getFirstText() {
        if (candidates != null && !candidates.isEmpty()) {
            Candidate firstCandidate = candidates.get(0);
            if (firstCandidate.getContent() != null &&
                firstCandidate.getContent().getParts() != null &&
                !firstCandidate.getContent().getParts().isEmpty()) {
                return firstCandidate.getContent().getParts().get(0).getText();
            }
        }
        return "No content available.";
    }
}

@Data
@NoArgsConstructor // <-- ADD THIS
@AllArgsConstructor // <-- ADD THIS
class Candidate {
    private Content content;
    // We can reuse the Content class from GeminiRequest, which is now fixed
}