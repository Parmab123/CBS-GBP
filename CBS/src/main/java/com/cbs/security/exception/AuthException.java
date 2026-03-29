package com.cbs.security.exception;

import lombok.Getter;

@Getter
public class AuthException extends RuntimeException {

    private final String error;
    private final int remainingAttempts;
    private final Long remainingSeconds;

    public AuthException(String error, String message) {
        super(message);
        this.error = error;
        this.remainingAttempts = 0;
        this.remainingSeconds = null;
    }

    public AuthException(String error, String message, int remainingAttempts, Long remainingSeconds) {
        super(message);
        this.error = error;
        this.remainingAttempts = remainingAttempts;
        this.remainingSeconds = remainingSeconds;
    }

}