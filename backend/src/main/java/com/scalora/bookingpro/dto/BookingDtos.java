package com.scalora.bookingpro.dto;

import com.scalora.bookingpro.entity.BookingStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

public class BookingDtos {
    public record BookingRequest(
        @NotNull Long serviceId,
        @NotNull LocalDate appointmentDate,
        @NotNull LocalTime appointmentTime,
        @NotBlank String customerName,
        @NotBlank String phoneNumber,
        @Email @NotBlank String email,
        String notes
    ) {}

    public record BookingResponse(
        Long id,
        Long serviceId,
        String serviceName,
        LocalDate appointmentDate,
        LocalTime appointmentTime,
        String customerName,
        String phoneNumber,
        String email,
        String notes,
        BookingStatus status,
        Instant createdAt
    ) {}

    public record StatusUpdateRequest(@NotNull BookingStatus status) {}
}
