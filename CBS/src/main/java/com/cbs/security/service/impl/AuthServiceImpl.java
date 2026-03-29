package com.cbs.security.service.impl;

import com.cbs.security.dto.LoginResponse;
import com.cbs.security.exception.AuthException;
import com.cbs.security.jwt.JwtUtil;
import com.cbs.security.service.AuthService;
import com.cbs.security.service.FailedAttemptsService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final JwtUtil jwtUtil;
    private final EntityManager entityManager;
    private final PasswordEncoder passwordEncoder;
    private final FailedAttemptsService failedAttemptsService;

    // ── Login ─────────────────────────────────────────────────────────────────

    @Transactional
    public LoginResponse login(String username, String password) {

        Query query = entityManager.createNativeQuery("""
                SELECT u.user_id, u.password, u.failed_attempts, u.status, r.role_name, u.locked_at
                FROM TB_USER_MASTER u
                JOIN TB_ROLE_MASTER r ON u.role_id = r.role_id
                WHERE u.username = :username
                """);

        query.setParameter("username", username);
        List<Object[]> result = query.getResultList();

        if (result.isEmpty()) {
            throw new AuthException(
                    "INVALID_CREDENTIALS",
                    "Invalid username or password"
                    // uses 2-arg constructor → remainingAttempts defaults to 0
            );
        }

        Object[] row = result.get(0);

        String userId = (String) row[0];
        String dbPassword = (String) row[1];
        Integer failedAttempts = (Integer) row[2];
        String status = (String) row[3];
        String role = (String) row[4];
        LocalDateTime lockedAt = (LocalDateTime) row[5];

        if (failedAttempts == null) failedAttempts = 0;

        /*
         ───────────────────────────────
         CHECK ACCOUNT LOCK
         ───────────────────────────────
         */

        if ("LOCKED".equalsIgnoreCase(status)) {

            if (lockedAt != null && LocalDateTime.now().isAfter(lockedAt.plusHours(1))) {

                // Lock expired — auto-unlock with 2 remaining attempts
                entityManager.createNativeQuery("""
                                UPDATE TB_USER_MASTER
                                SET status          = 'ACTIVE',
                                    failed_attempts = 2,
                                    locked_at       = NULL
                                WHERE user_id = :userId
                                """)
                        .setParameter("userId", userId)
                        .executeUpdate();

                failedAttempts = 2;
                status = "ACTIVE";

            } else {

                long secondsLeft = Duration.between(
                        LocalDateTime.now(),
                        lockedAt.plusHours(1)
                ).toSeconds();

                throw new AuthException(
                        "ACCOUNT_LOCKED",
                        "Account is locked",
                        0,           // int — no remaining attempts when locked
                        secondsLeft
                );
            }
        }

        /*
         ───────────────────────────────
         PASSWORD VALIDATION
         ───────────────────────────────
         */

        if (!passwordEncoder.matches(password, dbPassword)) {

            failedAttemptsService.increment(userId, failedAttempts);

            int remaining = 3 - (failedAttempts + 1);

            if (remaining <= 0) {
                throw new AuthException(
                        "ACCOUNT_LOCKED",
                        "Account locked after 3 failed attempts",
                        0,
                        3600L
                );
            }

            throw new AuthException(
                    "INVALID_CREDENTIALS",
                    "Invalid username or password",
                    remaining,
                    null
            );
        }

        /*
         ───────────────────────────────
         RESET FAILED ATTEMPTS
         ───────────────────────────────
         */

        entityManager.createNativeQuery("""
                        UPDATE TB_USER_MASTER
                        SET failed_attempts = 0,
                            status          = 'ACTIVE',
                            locked_at       = NULL
                        WHERE user_id = :userId
                        """)
                .setParameter("userId", userId)
                .executeUpdate();

        /*
         ───────────────────────────────
         GENERATE TOKENS
         ───────────────────────────────
         */

        String accessToken = jwtUtil.generateAccessToken(username, role);
        String refreshToken = jwtUtil.generateRefreshToken(username);

        entityManager.createNativeQuery("""
                        INSERT INTO TB_REFRESH_TOKEN
                            (TOKEN_ID, USER_ID, REFRESH_TOKEN, EXPIRY_DATE, IS_REVOKED)
                        VALUES
                            (:tokenId, :userId, :refreshToken, :expiryDate, false)
                        """)
                .setParameter("tokenId", java.util.UUID.randomUUID().toString())
                .setParameter("userId", userId)
                .setParameter("refreshToken", refreshToken)
                .setParameter("expiryDate",
                        new Timestamp(System.currentTimeMillis() + (1000L * 60 * 60 * 24)))
                .executeUpdate();

        return new LoginResponse(accessToken, refreshToken);
    }

    // ── Refresh Token ─────────────────────────────────────────────────────────

    @Transactional
    public LoginResponse refreshToken(String refreshToken) {

        String username = jwtUtil.extractUsername(refreshToken);

        Query query = entityManager.createNativeQuery("""
                SELECT rt.user_id, rt.expiry_date, rt.is_revoked, rm.role_name
                FROM TB_REFRESH_TOKEN rt
                JOIN TB_USER_MASTER   um ON rt.user_id  = um.user_id
                JOIN TB_ROLE_MASTER   rm ON um.role_id  = rm.role_id
                WHERE rt.refresh_token = :token
                """);                                        // ← cleaned up aliases

        query.setParameter("token", refreshToken);
        List<Object[]> result = query.getResultList();

        if (result.isEmpty()) {
            throw new AuthException(
                    "INVALID_REFRESH_TOKEN",
                    "Invalid refresh token"
            );
        }

        Object[] row = result.get(0);

        LocalDateTime expiry = (LocalDateTime) row[1];
        Boolean revoked = (Boolean) row[2];
        String role = (String) row[3];

        if (revoked) {
            throw new AuthException(
                    "TOKEN_REVOKED",
                    "Refresh token revoked"
            );
        }

        if (expiry.isBefore(LocalDateTime.now())) {
            throw new AuthException(
                    "TOKEN_EXPIRED",
                    "Refresh token expired"
            );
        }

        String newAccessToken = jwtUtil.generateAccessToken(username, role);

        return new LoginResponse(newAccessToken, refreshToken);
    }
}