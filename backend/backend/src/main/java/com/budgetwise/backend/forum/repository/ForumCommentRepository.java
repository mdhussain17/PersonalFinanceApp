package com.budgetwise.backend.forum.repository;

import com.budgetwise.backend.forum.entity.ForumComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional; // Import this

public interface ForumCommentRepository extends JpaRepository<ForumComment, Long> {
    
    // This is for your Admin "Delete User" feature
    @Transactional
    void deleteAllByUserId(Long userId);
}