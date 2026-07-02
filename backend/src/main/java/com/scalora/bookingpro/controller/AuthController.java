package com.scalora.bookingpro.controller;

import com.scalora.bookingpro.dto.AuthDtos.LoginRequest;
import com.scalora.bookingpro.dto.AuthDtos.LoginResponse;
import com.scalora.bookingpro.service.AuthService;
import jakarta.validation.Valid;
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
        return authService.me(authentication.getName());
    }
}
