package com.budgetwise.backend.service;

import com.budgetwise.backend.forum.dto.CreatePostDto;
import com.budgetwise.backend.forum.dto.ForumPostDto;
import java.util.List;
import java.util.Map;

public interface ForumService {
    List<ForumPostDto> getAllPosts(String userEmail);
    ForumPostDto createPost(CreatePostDto createPostDto, String userEmail);
    ForumPostDto getPostById(Long postId, String userEmail);
    void addCommentToPost(Long postId, String content, String userEmail);
    Map<String, Object> toggleLikePost(Long postId, String userEmail);

    // --- ADD THESE TWO NEW METHODS ---
    void deletePost(Long postId, String userEmail);
    void deleteComment(Long commentId, String userEmail);
}