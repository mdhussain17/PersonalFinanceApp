package com.budgetwise.backend.repository;

import com.budgetwise.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // Custom query to find a user by their email
    Optional<User> findByEmail(String email);
}