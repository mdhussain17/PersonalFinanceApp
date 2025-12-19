package com.budgetwise.backend.forum.entity;

import com.budgetwise.backend.entity.User;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@NoArgsConstructor
@Table(name = "post_likes", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "post_id"})) // A user can only like a post once
public class PostLike {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "post_id", nullable = false)
    private ForumPost post;

    public PostLike(User user, ForumPost post) {
        this.user = user;
        this.post = post;
    }
}