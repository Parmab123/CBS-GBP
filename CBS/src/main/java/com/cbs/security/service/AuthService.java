package com.cbs.security.service;

import com.cbs.security.dto.LoginResponse;
import java.util.Map;

public interface AuthService {
    
    // Step 1: Validate password and send OTP
    Map<String, String> validateAndSendOtp(String username, String password);
    
    // Step 2: Verify OTP and generate tokens
    LoginResponse verifyOtpAndLogin(String sessionId, String otp);
    
    // Resend OTP
    Map<String, String> resendOtp(String sessionId);
    
    // Refresh token
    LoginResponse refreshToken(String refreshToken);
}