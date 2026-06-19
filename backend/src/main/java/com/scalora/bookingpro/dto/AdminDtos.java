package com.scalora.bookingpro.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.DayOfWeek;
import java.time.LocalTime;

public class AdminDtos {
    public record BusinessRequest(@NotBlank String name, @NotBlank String slug, String tagline, boolean active) {}
    public record BusinessResponse(Long id, String name, String slug, String tagline, boolean active) {}

    public record AdminUserRequest(@Email @NotBlank String email, @NotBlank String password, @NotNull Long businessId) {}
    public record AdminUserResponse(Long id, String email, String role, Long businessId, String businessName) {}

    public record AvailabilityRequest(@NotNull DayOfWeek dayOfWeek, @NotNull LocalTime startTime, @NotNull LocalTime endTime, @NotNull @Min(1) Integer capacity, boolean active) {}
    public record AvailabilityResponse(Long id, DayOfWeek dayOfWeek, LocalTime startTime, LocalTime endTime, Integer capacity, boolean active) {}

    public record StaffRequest(@NotBlank String name, @NotBlank String role, @Email String email, String phoneNumber, boolean active) {}
    public record StaffResponse(Long id, String name, String role, String email, String phoneNumber, boolean active) {}

    public record TestimonialRequest(@NotBlank String customerName, @NotBlank String content, @Min(1) @Max(5) Integer rating, boolean active) {}
    public record TestimonialResponse(Long id, String customerName, String content, Integer rating, boolean active) {}

    public record BusinessInfoRequest(
        String businessName,
        String logoUrl,
        String coverImageUrl,
        String galleryImageUrls,
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
        String coverImageUrl,
        String galleryImageUrls,
        String phoneNumber,
        String whatsappNumber,
        String address,
        String openingHours,
        String facebookUrl,
        String instagramUrl,
        String linkedinUrl
    ) {}
}
