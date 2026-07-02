package com.scalora.bookingpro.service;

import com.scalora.bookingpro.dto.AuthDtos.LoginRequest;
import com.scalora.bookingpro.dto.AuthDtos.LoginResponse;
import com.scalora.bookingpro.repository.UserRepository;
import com.scalora.bookingpro.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
    private final AuthenticationManager authenticationManager;
    private final UserRepository users;
    private final JwtService jwtService;

    public AuthService(AuthenticationManager authenticationManager, UserRepository users, JwtService jwtService) {
        this.authenticationManager = authenticationManager;
        this.users = users;
        this.jwtService = jwtService;
    }

    @Transactional
    public LoginResponse login(LoginRequest request) {
        String email = normalizeEmail(request.email());
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, request.password()));
        var user = users.findByEmail(email).orElseThrow();
        String token = jwtService.generate(user);
        user.setSessionToken(token);
        users.saveAndFlush(user);
        return response(user, token);
    }

    @Transactional(readOnly = true)
    public LoginResponse me(String email) {
        var user = users.findByEmail(normalizeEmail(email)).orElseThrow();
        return response(user, null);
    }

    private LoginResponse response(com.scalora.bookingpro.entity.User user, String token) {
        var business = user.getBusiness();
        return new LoginResponse(
            token,
            user.getSessionToken(),
            user.getEmail(),
            user.getRole().name(),
            business == null ? null : business.getId(),
            business == null ? null : business.getSlug(),
            business == null ? null : business.getName()
        );
    }

    private String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase();
    }
}
