package com.scalora.bookingpro.controller;

import com.scalora.bookingpro.dto.AuthDtos.LoginRequest;
import com.scalora.bookingpro.dto.AuthDtos.LoginResponse;
import com.scalora.bookingpro.exception.ApiException;
import com.scalora.bookingpro.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @GetMapping("/me")
    public LoginResponse me(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Authentication required. Please log in again.");
        }
        return authService.me(authentication.getName());
    }
}
