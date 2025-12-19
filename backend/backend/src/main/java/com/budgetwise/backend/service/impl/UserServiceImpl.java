package com.budgetwise.backend.service.impl;

import com.budgetwise.backend.dto.ProfileDto;
import com.budgetwise.backend.dto.ProfileUpdateRequestDto;
import com.budgetwise.backend.entity.User;
// --- ADD THESE IMPORTS ---
import com.budgetwise.backend.forum.repository.ForumCommentRepository;
import com.budgetwise.backend.forum.repository.ForumPostRepository;
import com.budgetwise.backend.forum.repository.PostLikeRepository;
import com.budgetwise.backend.repository.BudgetRepository;
import com.budgetwise.backend.repository.SavingsGoalRepository;
import com.budgetwise.backend.repository.TransactionRepository;
// --- END IMPORTS ---
import com.budgetwise.backend.repository.UserRepository;
import com.budgetwise.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // <-- ADD THIS IMPORT

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserDetailsService, UserService { 
    
    private final UserRepository userRepository;
    // --- ADD THESE REPOSITORIES ---
    private final TransactionRepository transactionRepository;
    private final BudgetRepository budgetRepository;
    private final SavingsGoalRepository savingsGoalRepository;
    private final ForumPostRepository forumPostRepository;
    private final ForumCommentRepository forumCommentRepository;
    private final PostLikeRepository postLikeRepository;
    // --- END REPOSITORIES ---

    /**
     * This method is used by Spring Security to find a user during login.
     */
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + username));
    }

    /**
     * This method gets the user's profile information to be sent to the frontend.
     */
    @Override
    public ProfileDto getUserProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        return ProfileDto.builder()
                .name(user.getName())
                .email(user.getEmail())
                .monthlyIncome(user.getMonthlyIncome())
                .savingsGoal(user.getSavingsGoal())
                .targetExpenses(user.getTargetExpenses())
                .build();
    }

    /**
     * This new method updates a user's profile with new information.
     */
    @Override
    public void updateUserProfile(String email, ProfileUpdateRequestDto request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // Update the user's details from the request
        user.setName(request.getName());
        user.setMonthlyIncome(request.getMonthlyIncome());
        user.setSavingsGoal(request.getSavingsGoal());
        user.setTargetExpenses(request.getTargetExpenses());

        // Save the updated user back to the database
        userRepository.save(user);
    }

    // ---
    // --- ADD THIS NEW METHOD ---
    // ---
    /**
     * Deletes a user and all their associated data.
     * This is for a user deleting their OWN account.
     */
    @Override
    @Transactional
    public void deleteUserAccount(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        Long userId = user.getId();

        // 1. Delete all child records first
        transactionRepository.deleteAllByUserId(userId);
        budgetRepository.deleteAllByUserId(userId);
        savingsGoalRepository.deleteAllByUserId(userId);
        
        // 2. Delete forum records
        forumCommentRepository.deleteAllByUserId(userId);
        postLikeRepository.deleteAllByUserId(userId);
        forumPostRepository.deleteAllByUserId(userId);
        
        // 3. Finally, delete the user
        userRepository.delete(user);
    }
}