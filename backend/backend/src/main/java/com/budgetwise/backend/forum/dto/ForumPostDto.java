package com.budgetwise.backend.forum.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

// This DTO is used to send the full post (with counts and comments) to the frontend
@Data
public class ForumPostDto {
    private Long id;
    private String title;
    private String content;
    private LocalDateTime createdAt;
    private String username;
    private int likeCount;
    private int commentCount;
    private boolean likedByCurrentUser; // So the frontend knows to show a "liked" button
    private List<ForumCommentDto> comments;
}