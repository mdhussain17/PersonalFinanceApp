package com.budgetwise.backend.forum.repository;

import com.budgetwise.backend.forum.entity.PostLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional; // Import this
import java.util.Optional;

public interface PostLikeRepository extends JpaRepository<PostLike, Long> {
    // Find a like by a specific user on a specific post
    Optional<PostLike> findByUserIdAndPostId(Long userId, Long postId);

    // This is for your Admin "Delete User" feature
    @Transactional
    void deleteAllByUserId(Long userId);
}