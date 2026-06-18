package com.scalora.bookingpro.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class ServiceDtos {
    public record ServiceRequest(
        @NotBlank String name,
        @NotBlank String description,
        @NotNull @Min(1) Integer durationMinutes,
        @NotNull BigDecimal price,
        boolean active
    ) {}

    public record ServiceResponse(
        Long id,
        Long businessId,
        String name,
        String description,
        Integer durationMinutes,
        BigDecimal price,
        boolean active
    ) {}
}
