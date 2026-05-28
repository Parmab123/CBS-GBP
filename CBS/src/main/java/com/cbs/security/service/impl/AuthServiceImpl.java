package com.cbs.security.service.impl;

import com.cbs.security.dto.LoginResponse;
import com.cbs.security.exception.AuthException;
import com.cbs.security.jwt.JwtUtil;
import com.cbs.security.service.AuthService;
import com.cbs.security.service.FailedAttemptsService;
import com.cbs.security.service.SmsService;
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
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final JwtUtil jwtUtil;
    private final EntityManager entityManager;
    private final PasswordEncoder passwordEncoder;
    private final FailedAttemptsService failedAttemptsService;
    private final OtpServiceImpl otpService;
    private final SmsService smsService;

    // ══════════════════════════════════════════════════════════════════════════
    // STEP 1: VALIDATE PASSWORD & SEND OTP
    // ══════════════════════════════════════════════════════════════════════════

    @Override
    @Transactional
    public Map<String, String> validateAndSendOtp(String username, String password) {

        Query query = entityManager.createNativeQuery("""
                SELECT u.user_id, u.password, u.failed_attempts, u.status, 
                       u.locked_at, u.mobile
                FROM TB_USER_MASTER u
                WHERE u.username = :username
                """);

        query.setParameter("username", username);
        List<Object[]> result = query.getResultList();

        if (result.isEmpty()) {
            throw new AuthException(
                    "INVALID_CREDENTIALS",
                    "Invalid username or password"
            );
        }

        Object[] row = result.get(0);

        String userId = (String) row[0];
        String dbPassword = (String) row[1];
        Integer failedAttempts = (Integer) row[2];
        String status = (String) row[3];
        LocalDateTime lockedAt = (LocalDateTime) row[4];
        String mobile = (String) row[5];

        if (failedAttempts == null)
            failedAttempts = 0;

        /*
         * ───────────────────────────────
         * CHECK ACCOUNT LOCK
         * ───────────────────────────────
         */

        if ("LOCKED".equalsIgnoreCase(status)) {
            if (lockedAt != null && LocalDateTime.now().isAfter(lockedAt.plusHours(1))) {
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
                        lockedAt.plusHours(1)).toSeconds();

                throw new AuthException(
                        "ACCOUNT_LOCKED",
                        "Account is locked",
                        0,
                        secondsLeft);
            }
        }

        /*
         * ───────────────────────────────
         * PASSWORD VALIDATION
         * ───────────────────────────────
         */

        if (!passwordEncoder.matches(password, dbPassword)) {

            failedAttemptsService.increment(userId, failedAttempts);

            int remaining = 3 - (failedAttempts + 1);

            if (remaining <= 0) {
                throw new AuthException(
                        "ACCOUNT_LOCKED",
                        "Account locked after 3 failed attempts",
                        0,
                        3600L);
            }

            throw new AuthException(
                    "INVALID_CREDENTIALS",
                    "Invalid username or password",
                    remaining,
                    null);
        }

        /*
         * ───────────────────────────────
         * GENERATE & SEND OTP
         * ───────────────────────────────
         */

        String otp = otpService.generateOtp();
        otpService.storeOtp(userId, otp, mobile);
        smsService.sendOtp(mobile, otp);

        // Return temporary session identifier (don't send userId directly)
        String sessionId = UUID.randomUUID().toString();

        // Store session temporarily
//        entityManager.createNativeQuery("""
//                INSERT INTO TB_OTP_SESSION
//                    (SESSION_ID, USER_ID, USERNAME, CREATED_AT, EXPIRES_AT)
//                VALUES
//                    (:sessionId, :userId, :username, :createdAt, :expiresAt)
//                """)
//                .setParameter("sessionId", sessionId)
//                .setParameter("userId", userId)
//                .setParameter("username", username)
//                .setParameter("createdAt", LocalDateTime.now())
//                .setParameter("expiresAt", LocalDateTime.now().plusMinutes(10))
//                .executeUpdate();


        entityManager.createNativeQuery("""
                        INSERT INTO TB_OTP_SESSION
                            (SESSION_ID, USER_ID, USERNAME, CREATED_AT, EXPIRES_AT)
                        VALUES
                            (:sessionId, :userId, :username, :createdAt, :expiresAt)
                        """)
                .setParameter("sessionId", sessionId)
                .setParameter("userId", userId)
                .setParameter("username", username)
                .setParameter("createdAt", LocalDateTime.now())
                .setParameter("expiresAt", LocalDateTime.now().plusMinutes(1))
                .executeUpdate();

//
//        return Map.of(
//                "message", "OTP sent to your registered mobile number",
//                "sessionId", sessionId,
//                "maskedMobile", maskMobile(mobile)
//        );


        return Map.of(
                "message", "OTP sent to your registered mobile number",
                "sessionId", sessionId,
                "maskedMobile", maskMobile(mobile),
                "expiresIn", "60"
        );
    }

    // ══════════════════════════════════════════════════════════════════════════
    // STEP 2: VERIFY OTP & LOGIN
    // ══════════════════════════════════════════════════════════════════════════

    @Override
    @Transactional
    public LoginResponse verifyOtpAndLogin(String sessionId, String otp) {

        // Get user from session
        Query sessionQuery = entityManager.createNativeQuery("""
                SELECT user_id, username, expires_at
                FROM TB_OTP_SESSION
                WHERE session_id = :sessionId
                """);

        sessionQuery.setParameter("sessionId", sessionId);
        List<Object[]> sessionResult = sessionQuery.getResultList();

        if (sessionResult.isEmpty()) {
            throw new AuthException(
                    "INVALID_SESSION",
                    "Invalid or expired session"
            );
        }

        Object[] sessionRow = sessionResult.get(0);
        String userId = (String) sessionRow[0];
        String username = (String) sessionRow[1];
        LocalDateTime expiresAt = (LocalDateTime) sessionRow[2];

        // Check session expiry
        if (LocalDateTime.now().isAfter(expiresAt)) {
            throw new AuthException(
                    "SESSION_EXPIRED",
                    "Session expired. Please login again"
            );
        }

        // Verify OTP
        if (!otpService.verifyOtp(userId, otp)) {
            throw new AuthException(
                    "INVALID_OTP",
                    "Invalid or expired OTP"
            );
        }

        // Get role for token generation
        Query roleQuery = entityManager.createNativeQuery("""
                SELECT r.role_name
                FROM TB_USER_MASTER u
                JOIN TB_ROLE_MASTER r ON u.role_id = r.role_id
                WHERE u.user_id = :userId
                """);

        roleQuery.setParameter("userId", userId);
        String role = (String) roleQuery.getSingleResult();

        /*
         * ───────────────────────────────
         * RESET FAILED ATTEMPTS
         * ───────────────────────────────
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
         * ───────────────────────────────
         * GENERATE TOKENS
         * ───────────────────────────────
         */

        String accessToken = jwtUtil.generateAccessToken(username, role);
        String refreshToken = jwtUtil.generateRefreshToken(username);

        entityManager.createNativeQuery("""
                        INSERT INTO TB_REFRESH_TOKEN
                            (TOKEN_ID, USER_ID, REFRESH_TOKEN, EXPIRY_DATE, IS_REVOKED)
                        VALUES
                            (:tokenId, :userId, :refreshToken, :expiryDate, false)
                        """)
                .setParameter("tokenId", UUID.randomUUID().toString())
                .setParameter("userId", userId)
                .setParameter("refreshToken", refreshToken)
                .setParameter("expiryDate",
                        new Timestamp(System.currentTimeMillis() + (1000L * 60 * 60 * 24)))
                .executeUpdate();

        // Delete OTP session
        entityManager.createNativeQuery("""
                        DELETE FROM TB_OTP_SESSION
                        WHERE session_id = :sessionId
                        """)
                .setParameter("sessionId", sessionId)
                .executeUpdate();

        return new LoginResponse(accessToken, refreshToken);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // RESEND OTP
    // ══════════════════════════════════════════════════════════════════════════

    @Override
    @Transactional
    public Map<String, String> resendOtp(String sessionId) {

        // Get user from session
        Query sessionQuery = entityManager.createNativeQuery("""
                SELECT user_id, expires_at
                FROM TB_OTP_SESSION
                WHERE session_id = :sessionId
                """);

        sessionQuery.setParameter("sessionId", sessionId);
        List<Object[]> sessionResult = sessionQuery.getResultList();

        if (sessionResult.isEmpty()) {
            throw new AuthException(
                    "INVALID_SESSION",
                    "Invalid or expired session"
            );
        }

        Object[] sessionRow = sessionResult.get(0);
        String userId = (String) sessionRow[0];
        LocalDateTime expiresAt = (LocalDateTime) sessionRow[1];

        // Check session expiry
        if (LocalDateTime.now().isAfter(expiresAt)) {
            throw new AuthException(
                    "SESSION_EXPIRED",
                    "Session expired. Please login again"
            );
        }

        // Get mobile number
        Query mobileQuery = entityManager.createNativeQuery("""
                SELECT mobile
                FROM TB_USER_MASTER
                WHERE user_id = :userId
                """);

        mobileQuery.setParameter("userId", userId);
        String mobile = (String) mobileQuery.getSingleResult();

        // Generate and send new OTP
        String otp = otpService.generateOtp();
        otpService.storeOtp(userId, otp, mobile);
        smsService.sendOtp(mobile, otp);

//        return Map.of(
//                "message", "OTP resent successfully",
//                "maskedMobile", maskMobile(mobile)
//        );

        return Map.of(
                "message", "OTP resent successfully",
                "maskedMobile", maskMobile(mobile),
                "expiresIn", "600"
        );
    }

    // ══════════════════════════════════════════════════════════════════════════
    // REFRESH TOKEN
    // ══════════════════════════════════════════════════════════════════════════

    @Override
    @Transactional
    public LoginResponse refreshToken(String refreshToken) {

        String username = jwtUtil.extractUsername(refreshToken);

        Query query = entityManager.createNativeQuery("""
                SELECT rt.user_id, rt.expiry_date, rt.is_revoked, rm.role_name
                FROM TB_REFRESH_TOKEN rt
                JOIN TB_USER_MASTER   um ON rt.user_id  = um.user_id
                JOIN TB_ROLE_MASTER   rm ON um.role_id  = rm.role_id
                WHERE rt.refresh_token = :token
                """);

        query.setParameter("token", refreshToken);
        List<Object[]> result = query.getResultList();

        if (result.isEmpty()) {
            throw new AuthException(
                    "INVALID_REFRESH_TOKEN",
                    "Invalid refresh token");
        }

        Object[] row = result.get(0);

        LocalDateTime expiry = (LocalDateTime) row[1];
        Boolean revoked = (Boolean) row[2];
        String role = (String) row[3];

        if (revoked) {
            throw new AuthException(
                    "TOKEN_REVOKED",
                    "Refresh token revoked");
        }

        if (expiry.isBefore(LocalDateTime.now())) {
            throw new AuthException(
                    "TOKEN_EXPIRED",
                    "Refresh token expired");
        }

        String newAccessToken = jwtUtil.generateAccessToken(username, role);

        return new LoginResponse(newAccessToken, refreshToken);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // HELPER METHODS
    // ══════════════════════════════════════════════════════════════════════════

    private String maskMobile(String mobile) {
        if (mobile == null || mobile.length() < 4) return "****";
        return "******" + mobile.substring(mobile.length() - 4);
    }
}