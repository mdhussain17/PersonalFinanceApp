package com.budgetwise.backend.ai.dto;

import lombok.AllArgsConstructor; // <-- ADD THIS
import lombok.Data;
import lombok.NoArgsConstructor; // <-- ADD THIS
import java.util.List;

@Data
@NoArgsConstructor // <-- ADD THIS
public class GeminiRequest {
    private List<Content> contents;

    public GeminiRequest(String text) {
        this.contents = List.of(new Content(text));
    }
}

@Data
@NoArgsConstructor // <-- ADD THIS
@AllArgsConstructor // <-- ADD THIS
class Content {
    private List<Part> parts;
    public Content(String text) {
        this.parts = List.of(new Part(text));
    }
}

@Data
@NoArgsConstructor // <-- ADD THIS
@AllArgsConstructor // <-- ADD THIS
class Part {
    private String text;
}