package com.cbs.security.dto;

import lombok.Data;

@Data
public class RefreshRequest {
    private String refreshToken;
}