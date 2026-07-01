package com.scalora.bookingpro.controller;

import com.scalora.bookingpro.dto.AdminDtos.BusinessResponse;
import com.scalora.bookingpro.dto.AdminDtos.StaffResponse;
import com.scalora.bookingpro.dto.AdminDtos.TestimonialResponse;
import com.scalora.bookingpro.dto.BookingDtos.BookingRequest;
import com.scalora.bookingpro.dto.BookingDtos.BookingResponse;
import com.scalora.bookingpro.dto.ServiceDtos.ServiceResponse;
import com.scalora.bookingpro.service.AdminContentService;
import com.scalora.bookingpro.service.BookingService;
import com.scalora.bookingpro.service.ServiceCatalogService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public/businesses")
public class PublicBusinessController {
    private final AdminContentService content;
    private final ServiceCatalogService services;
    private final BookingService bookings;

    public PublicBusinessController(AdminContentService content, ServiceCatalogService services, BookingService bookings) {
        this.content = content;
        this.services = services;
        this.bookings = bookings;
    }

    @GetMapping
    public List<BusinessResponse> businesses() {
        return content.publicBusinesses();
    }

    @GetMapping("/{slug}")
    public BusinessResponse business(@PathVariable String slug) {
        return content.businessBySlug(slug);
    }

    @GetMapping("/{slug}/services")
    public List<ServiceResponse> services(@PathVariable String slug) {
        content.businessBySlug(slug);
        return services.publicServices(slug);
    }

    @GetMapping("/{slug}/staff")
    public List<StaffResponse> staff(@PathVariable String slug) {
        content.businessBySlug(slug);
        return content.publicStaff(slug);
    }

    @GetMapping("/{slug}/testimonials")
    public List<TestimonialResponse> testimonials(@PathVariable String slug) {
        content.businessBySlug(slug);
        return content.publicTestimonials(slug);
    }

    @PostMapping("/{slug}/bookings")
    @ResponseStatus(HttpStatus.CREATED)
    public BookingResponse booking(@PathVariable String slug, @Valid @RequestBody BookingRequest request) {
        content.businessBySlug(slug);
        return bookings.createForBusiness(slug, request);
    }
}
