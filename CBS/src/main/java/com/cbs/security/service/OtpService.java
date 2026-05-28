package com.cbs.security.service;

public interface OtpService {
    void storeOtp(String userId, String otp, String mobile);
    boolean verifyOtp(String userId, String otp);
    
}
