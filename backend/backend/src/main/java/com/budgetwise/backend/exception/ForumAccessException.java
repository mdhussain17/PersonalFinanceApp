package com.budgetwise.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * This custom exception will automatically return a 403 FORBIDDEN error
 * whenever it is thrown from a controller.
 */
@ResponseStatus(value = HttpStatus.FORBIDDEN)
public class ForumAccessException extends RuntimeException {

    // --- THIS IS THE FIX ---
    // Add this line to remove the warning.
    private static final long serialVersionUID = 1L;
    // --- END FIX ---

    public ForumAccessException(String message) {
        super(message);
    }
}