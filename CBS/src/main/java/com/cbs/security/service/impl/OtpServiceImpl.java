package com.cbs.security.service.impl;

import com.cbs.security.service.OtpService;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Random;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OtpServiceImpl implements OtpService {

    private final EntityManager entityManager;

    public String generateOtp() {
        return String.format("%06d", new Random().nextInt(999999));
    }

    @Transactional
    public void storeOtp(String userId, String otp, String mobile) {

        // Delete any existing OTP for this user
        entityManager.createNativeQuery("""
                        DELETE FROM TB_OTP
                        WHERE user_id = :userId
                        """)
                .setParameter("userId", userId)
                .executeUpdate();

        // Insert new OTP with 5 minute expiry
        entityManager.createNativeQuery("""
                        INSERT INTO TB_OTP
                            (OTP_ID, USER_ID, OTP_CODE, MOBILE, EXPIRY_TIME, VERIFIED, CREATED_AT)
                        VALUES
                            (:otpId, :userId, :otp, :mobile, :expiryTime, false, :createdAt)
                        """)
                .setParameter("otpId", UUID.randomUUID().toString())
                .setParameter("userId", userId)
                .setParameter("otp", otp)
                .setParameter("mobile", mobile)
                .setParameter("expiryTime", LocalDateTime.now().plusMinutes(5))
                .setParameter("createdAt", LocalDateTime.now())
                .executeUpdate();
    }

    @Transactional
    public boolean verifyOtp(String userId, String otp) {

        var query = entityManager.createNativeQuery("""
                SELECT otp_code, expiry_time, verified
                FROM TB_OTP
                WHERE user_id = :userId
                ORDER BY created_at DESC
                LIMIT 1
                """);

        query.setParameter("userId", userId);
        var result = query.getResultList();

        if (result.isEmpty()) {
            return false;
        }

        Object[] row = (Object[]) result.get(0);
        String storedOtp = (String) row[0];
        LocalDateTime expiryTime = (LocalDateTime) row[1];
        Boolean verified = (Boolean) row[2];

        // Check if already verified
        if (verified) {
            return false;
        }

        // Check expiry
        if (LocalDateTime.now().isAfter(expiryTime)) {
            return false;
        }

        // Verify OTP
        if (storedOtp.equals(otp)) {
            // Mark as verified
            entityManager.createNativeQuery("""
                            UPDATE TB_OTP
                            SET verified = true
                            WHERE user_id = :userId
                            """)
                    .setParameter("userId", userId)
                    .executeUpdate();
            return true;
        }


        return false;
    }
}