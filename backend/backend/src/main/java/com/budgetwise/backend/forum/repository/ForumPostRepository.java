package com.budgetwise.backend.forum.repository;

import com.budgetwise.backend.forum.entity.ForumPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional; // Import this
import java.util.List;

public interface ForumPostRepository extends JpaRepository<ForumPost, Long> {
    // Find all posts, show the newest ones first
    List<ForumPost> findByOrderByCreatedAtDesc();

    // This is for your Admin "Delete User" feature
    @Transactional
    void deleteAllByUserId(Long userId);
}