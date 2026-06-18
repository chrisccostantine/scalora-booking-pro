package com.scalora.bookingpro.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.time.Instant;

public class ContactDtos {
    public record ContactRequest(@NotBlank String name, @Email @NotBlank String email, String phoneNumber, @NotBlank String message) {}
    public record ContactResponse(Long id, String name, String email, String phoneNumber, String message, Instant createdAt) {}
}
