package com.budgetwise.backend.forum.dto;

import lombok.Data;

// This DTO is used to receive data for a new post
@Data
public class CreatePostDto {
    private String title;
    private String content;
}