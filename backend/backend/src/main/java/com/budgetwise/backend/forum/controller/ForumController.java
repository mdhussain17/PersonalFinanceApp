package com.budgetwise.backend.forum.controller;

import com.budgetwise.backend.forum.dto.CreatePostDto;
import com.budgetwise.backend.forum.dto.ForumPostDto;
import com.budgetwise.backend.service.ForumService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.DeleteMapping; // <-- 1. ADD THIS IMPORT
import org.springframework.web.bind.annotation.ResponseStatus; // <-- 2. ADD THIS IMPORT

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/forum") // All forum APIs will start with this URL
@RequiredArgsConstructor
public class ForumController {

    private final ForumService forumService;

    // GET /api/forum/posts (Get all posts)
    @GetMapping("/posts")
    public ResponseEntity<List<ForumPostDto>> getAllPosts(Principal principal) {
        return ResponseEntity.ok(forumService.getAllPosts(principal.getName()));
    }

    // POST /api/forum/posts (Create a new post)
    @PostMapping("/posts")
    public ResponseEntity<ForumPostDto> createPost(@RequestBody CreatePostDto createPostDto, Principal principal) {
        ForumPostDto post = forumService.createPost(createPostDto, principal.getName());
        return new ResponseEntity<>(post, HttpStatus.CREATED);
    }

    // GET /api/forum/posts/{id} (Get a single post by its ID)
    @GetMapping("/posts/{id}")
    public ResponseEntity<ForumPostDto> getPostById(@PathVariable("id") Long postId, Principal principal) {
        return ResponseEntity.ok(forumService.getPostById(postId, principal.getName()));
    }

    // POST /api/forum/posts/{id}/comments (Add a comment to a post)
    @PostMapping("/posts/{id}/comments")
    public ResponseEntity<Void> addComment(@PathVariable("id") Long postId, 
                                           @RequestBody Map<String, String> request, // Receives {"content": "My comment"}
                                           Principal principal) {
        forumService.addCommentToPost(postId, request.get("content"), principal.getName());
        return new ResponseEntity<>(HttpStatus.CREATED);
    }

    // POST /api/forum/posts/{id}/like (Toggle like/unlike on a post)
    @PostMapping("/posts/{id}/like")
    public ResponseEntity<Map<String, Object>> toggleLike(@PathVariable("id") Long postId, Principal principal) {
        Map<String, Object> response = forumService.toggleLikePost(postId, principal.getName());
        return ResponseEntity.ok(response);
    }

    // ---
    // --- 3. ADD THESE TWO NEW ENDPOINTS ---
    // ---

    /**
     * Deletes a post. Only the post owner or an Admin can do this.
     * React will call: DELETE /api/forum/posts/{id}
     */
    @DeleteMapping("/posts/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT) // Returns a 204 No Content on success
    public void deletePost(@PathVariable("id") Long postId, Principal principal) {
        // The service layer handles the security check
        forumService.deletePost(postId, principal.getName());
    }

    /**
     * Deletes a comment. Only the comment owner or an Admin can do this.
     * React will call: DELETE /api/forum/comments/{id}
     */
    @DeleteMapping("/comments/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT) // Returns a 204 No Content on success
    public void deleteComment(@PathVariable("id") Long commentId, Principal principal) {
        // The service layer handles the security check
        forumService.deleteComment(commentId, principal.getName());
    }
}