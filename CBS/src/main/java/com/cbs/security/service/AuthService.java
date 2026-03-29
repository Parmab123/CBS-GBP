package com.cbs.security.service;

import com.cbs.security.dto.LoginResponse;

public interface AuthService {
    LoginResponse login(String username, String password);

    LoginResponse refreshToken(String refreshToken);
}