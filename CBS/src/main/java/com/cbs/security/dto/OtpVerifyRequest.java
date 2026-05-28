package com.cbs.security.dto;

import lombok.Data;

@Data
public class OtpVerifyRequest {
    private String sessionId;

    private String otp;
}