package com.cbs.security.controller;

import com.cbs.security.dto.LoginRequest;
import com.cbs.security.dto.LoginResponse;
import com.cbs.security.dto.RefreshRequest;
import com.cbs.security.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {

        LoginResponse response =
                authService.login(request.getUsername(), request.getPassword());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<LoginResponse> refresh(
            @RequestBody RefreshRequest request) {

        LoginResponse response =
                authService.refreshToken(request.getRefreshToken());

        return ResponseEntity.ok(response);
    }
}
