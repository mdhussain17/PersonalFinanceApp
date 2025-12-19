package com.budgetwise.backend.service.impl;

import com.budgetwise.backend.entity.User;
import com.budgetwise.backend.exception.ForumAccessException;
import com.budgetwise.backend.forum.dto.CreatePostDto;
import com.budgetwise.backend.forum.dto.ForumCommentDto;
import com.budgetwise.backend.forum.dto.ForumPostDto;
import com.budgetwise.backend.forum.entity.ForumComment;
import com.budgetwise.backend.forum.entity.ForumPost;
import com.budgetwise.backend.forum.entity.PostLike;
import com.budgetwise.backend.forum.repository.ForumCommentRepository;
import com.budgetwise.backend.forum.repository.ForumPostRepository;
import com.budgetwise.backend.forum.repository.PostLikeRepository;
import com.budgetwise.backend.repository.UserRepository;
import com.budgetwise.backend.service.ForumService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ForumServiceImpl implements ForumService {

    private final ForumPostRepository postRepository;
    private final ForumCommentRepository commentRepository;
    private final PostLikeRepository likeRepository;
    private final UserRepository userRepository;

    // ... (getAllPosts, createPost, getPostById, addCommentToPost, toggleLikePost) ...
    // ... (These methods are unchanged) ...

    @Override
    public List<ForumPostDto> getAllPosts(String userEmail) {
        User user = findUserByEmail(userEmail);
        List<ForumPost> posts = postRepository.findByOrderByCreatedAtDesc();
        return posts.stream()
                .map(post -> mapToPostDto(post, user.getId()))
                .collect(Collectors.toList());
    }

    @Override
    public ForumPostDto createPost(CreatePostDto createPostDto, String userEmail) {
        User user = findUserByEmail(userEmail);
        ForumPost post = new ForumPost();
        post.setTitle(createPostDto.getTitle());
        post.setContent(createPostDto.getContent());
        post.setUser(user);
        ForumPost savedPost = postRepository.save(post);
        return mapToPostDto(savedPost, user.getId());
    }

    @Override
    public ForumPostDto getPostById(Long postId, String userEmail) {
        User user = findUserByEmail(userEmail);
        ForumPost post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        return mapToPostDto(post, user.getId());
    }

    @Override
    public void addCommentToPost(Long postId, String content, String userEmail) {
        User user = findUserByEmail(userEmail);
        ForumPost post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        
        ForumComment comment = new ForumComment();
        comment.setContent(content);
        comment.setUser(user);
        comment.setPost(post);
        commentRepository.save(comment);
    }

    @Override
    @Transactional
    public Map<String, Object> toggleLikePost(Long postId, String userEmail) {
        User user = findUserByEmail(userEmail);
        ForumPost post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        
        Optional<PostLike> existingLike = likeRepository.findByUserIdAndPostId(user.getId(), postId);
        
        boolean liked;
        if (existingLike.isPresent()) {
            likeRepository.delete(existingLike.get());
            liked = false;
        } else {
            likeRepository.save(new PostLike(user, post));
            liked = true;
        }
        
        ForumPost updatedPost = postRepository.findById(postId).get();
        int newLikeCount = updatedPost.getLikes().size();

        return Map.of("liked", liked, "newLikeCount", newLikeCount);
    }

    // ---
    // --- THIS IS THE CORRECTED DELETE LOGIC ---
    // ---

    @Override
    @Transactional
    public void deletePost(Long postId, String userEmail) {
        User user = findUserByEmail(userEmail);
        ForumPost post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        // **SECURITY CHECK:**
        // Only allow deletion if the user is the owner.
        boolean isOwner = post.getUser().getId().equals(user.getId());

        if (!isOwner) {
            // If not the owner, throw the 403 Forbidden error.
            throw new ForumAccessException("User is not authorized to delete this post.");
        }

        // If the check passes, delete the post.
        postRepository.delete(post);
    }

    @Override
    @Transactional
    public void deleteComment(Long commentId, String userEmail) {
        User user = findUserByEmail(userEmail);
        ForumComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        // **SECURITY CHECK:**
        // Only allow deletion if the user is the owner.
        boolean isOwner = comment.getUser().getId().equals(user.getId());

        if (!isOwner) {
            // If not the owner, throw the 403 Forbidden error.
            throw new ForumAccessException("User is not authorized to delete this comment.");
        }

        // If the check passes, delete the comment.
        commentRepository.delete(comment);
    }
    
    // ... (all your helper methods: findUserByEmail, mapToPostDto, etc.) ...

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    private ForumPostDto mapToPostDto(ForumPost post, Long currentUserId) {
        ForumPostDto dto = new ForumPostDto();
        dto.setId(post.getId());
        dto.setTitle(post.getTitle());
        dto.setContent(post.getContent());
        dto.setCreatedAt(post.getCreatedAt());
        dto.setUsername(post.getUser().getUsername());
        dto.setLikeCount(post.getLikes().size());
        dto.setCommentCount(post.getComments().size());
        dto.setLikedByCurrentUser(post.getLikes().stream()
                .anyMatch(like -> like.getUser().getId().equals(currentUserId)));
        dto.setComments(post.getComments().stream()
                .map(this::mapToCommentDto)
                .sorted((c1, c2) -> c2.getCreatedAt().compareTo(c1.getCreatedAt()))
                .collect(Collectors.toList()));
        
        return dto;
    }

    private ForumCommentDto mapToCommentDto(ForumComment comment) {
        ForumCommentDto dto = new ForumCommentDto();
        dto.setId(comment.getId());
        dto.setContent(comment.getContent());
        dto.setCreatedAt(comment.getCreatedAt());
        dto.setUsername(comment.getUser().getUsername());
        return dto;
    }
}