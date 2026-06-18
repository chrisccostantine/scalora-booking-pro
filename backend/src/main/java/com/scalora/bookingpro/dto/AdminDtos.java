package com.scalora.bookingpro.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public class AdminDtos {
    public record StaffRequest(@NotBlank String name, @NotBlank String role, @Email String email, String phoneNumber, boolean active) {}
    public record StaffResponse(Long id, String name, String role, String email, String phoneNumber, boolean active) {}

    public record TestimonialRequest(@NotBlank String customerName, @NotBlank String content, @Min(1) @Max(5) Integer rating, boolean active) {}
    public record TestimonialResponse(Long id, String customerName, String content, Integer rating, boolean active) {}

    public record BusinessInfoRequest(
        String businessName,
        String logoUrl,
        String phoneNumber,
        String whatsappNumber,
        String address,
        String openingHours,
        String facebookUrl,
        String instagramUrl,
        String linkedinUrl
    ) {}

    public record BusinessInfoResponse(
        Long id,
        String businessName,
        String logoUrl,
        String phoneNumber,
        String whatsappNumber,
        String address,
        String openingHours,
        String facebookUrl,
        String instagramUrl,
        String linkedinUrl
    ) {}
}
