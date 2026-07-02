package com.scalora.bookingpro.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalTime;
import java.util.List;

public class AdminDtos {
    public record BusinessRequest(
        @NotBlank String name,
        @NotBlank String slug,
        String tagline,
        String description,
        String logoUrl,
        String coverImageUrl,
        String galleryImageUrls,
        String primaryColor,
        String secondaryColor,
        String accentColor,
        String fontStyle,
        String buttonStyle,
        String phone,
        String whatsappNumber,
        @Email String email,
        String address,
        String googleMapsUrl,
        String openingHours,
        String instagramUrl,
        String facebookUrl,
        String tiktokUrl,
        String ownerName,
        @Email String ownerEmail,
        String ownerPassword,
        String temporaryPassword,
        boolean active
    ) {}

    public record BusinessResponse(
        Long id,
        String name,
        String slug,
        String tagline,
        String description,
        String logoUrl,
        String coverImageUrl,
        String galleryImageUrls,
        String primaryColor,
        String secondaryColor,
        String accentColor,
        String fontStyle,
        String buttonStyle,
        String phone,
        String phoneNumber,
        String whatsappNumber,
        String email,
        String address,
        String googleMapsUrl,
        String openingHours,
        String instagramUrl,
        String facebookUrl,
        String tiktokUrl,
        String ownerName,
        String ownerEmail,
        String status,
        boolean active,
        Instant createdAt,
        Instant updatedAt
    ) {}

    public record PlatformAnalyticsResponse(
        long totalBusinesses,
        long activeBusinesses,
        long inactiveBusinesses,
        long bookingsToday,
        long pendingBookings,
        long confirmedBookings,
        long completedBookings,
        long newBusinessesThisMonth,
        List<String> mostActiveBusinesses
    ) {}

    public record AdminUserRequest(@Email @NotBlank String email, @NotBlank String password, @NotNull Long businessId) {}
    public record AdminUserResponse(Long id, String email, String role, Long businessId, String businessName) {}
    public record OwnerPasswordResetRequest(@NotBlank String password) {}
    public record OwnerPasswordResetResponse(String email, Long businessId, String businessName) {}
    public record PasswordChangeRequest(@NotBlank String currentPassword, @NotBlank String newPassword) {}

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
