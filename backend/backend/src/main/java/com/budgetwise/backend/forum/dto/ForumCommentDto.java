package com.budgetwise.backend.forum.dto;

import lombok.Data;
import java.time.LocalDateTime;

// This DTO is used to send clean comment data to the frontend
@Data
public class ForumCommentDto {
    private Long id;
    private String content;
    private LocalDateTime createdAt;
    private String username; 
}