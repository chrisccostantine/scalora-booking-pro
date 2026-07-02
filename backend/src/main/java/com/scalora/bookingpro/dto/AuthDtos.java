package com.scalora.bookingpro.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class AuthDtos {
    public record LoginRequest(@Email @NotBlank String email, @NotBlank String password) {}
    public record LoginResponse(String token, String sessionToken, String email, String role, Long businessId, String businessSlug, String businessName) {}
}
