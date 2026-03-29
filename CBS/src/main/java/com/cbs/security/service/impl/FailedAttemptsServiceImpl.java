package com.cbs.security.service.impl;

import com.cbs.security.service.FailedAttemptsService;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class FailedAttemptsServiceImpl implements FailedAttemptsService {

    private final EntityManager entityManager;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void increment(String userId, int currentAttempts) {
        int newAttempts = currentAttempts + 1;
        entityManager.createNativeQuery("""
                        UPDATE TB_USER_MASTER
                        SET failed_attempts = :attempts,
                            status    = CASE WHEN :attempts >= 3 THEN 'LOCKED' ELSE status END,
                            locked_at = CASE WHEN :attempts >= 3 THEN CURRENT_TIMESTAMP ELSE locked_at END
                        WHERE user_id = :userId
                        """)
                .setParameter("attempts", newAttempts)
                .setParameter("userId", userId)
                .executeUpdate();
    }
}