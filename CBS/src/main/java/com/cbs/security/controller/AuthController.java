package com.cbs.security.controller;

import com.cbs.security.dto.LoginRequest;
import com.cbs.security.dto.LoginResponse;
import com.cbs.security.dto.RefreshRequest;
import com.cbs.security.dto.OtpVerifyRequest;
import com.cbs.security.service.AuthService;
import com.cbs.security.service.impl.AuthServiceImpl;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthServiceImpl authService;

    // Step 1: Validate credentials and send OTP
    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody LoginRequest request) {
        Map<String, String> response = authService.validateAndSendOtp(
                request.getUsername(), 
                request.getPassword()
        );
        return ResponseEntity.ok(response);
    }

    // Step 2: Verify OTP and get JWT tokens
    @PostMapping("/verify-otp")
    public ResponseEntity<LoginResponse> verifyOtp(@RequestBody OtpVerifyRequest request) {
        LoginResponse response = authService.verifyOtpAndLogin(
                request.getSessionId(), 
                request.getOtp()
        );
        return ResponseEntity.ok(response);
    }

    // Optional: Resend OTP if user didn't receive it
    @PostMapping("/resend-otp")
    public ResponseEntity<Map<String, String>> resendOtp(@RequestBody Map<String, String> request) {
        String sessionId = request.get("sessionId");
        Map<String, String> response = authService.resendOtp(sessionId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<LoginResponse> refresh(@RequestBody RefreshRequest request) {
        LoginResponse response = authService.refreshToken(request.getRefreshToken());
        return ResponseEntity.ok(response);
    }
}