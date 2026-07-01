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

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        String email = normalizeEmail(request.email());
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, request.password()));
        var user = users.findByEmail(email).orElseThrow();
        var business = user.getBusiness();
        return new LoginResponse(
            jwtService.generate(user),
            user.getEmail(),
            user.getRole().name(),
            business == null ? null : business.getId(),
            business == null ? null : business.getSlug()
        );
    }

    private String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase();
    }
}
