package com.cbs.security.service;

public interface FailedAttemptsService {
    void increment(String userId, int currentAttempts);
}