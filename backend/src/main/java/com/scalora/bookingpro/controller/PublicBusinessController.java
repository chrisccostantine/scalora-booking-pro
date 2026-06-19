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
@RequestMapping("/api/public/businesses/{slug}")
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
    public BusinessResponse business(@PathVariable String slug) {
        return content.activeBusinessBySlug(slug);
    }

    @GetMapping("/services")
    public List<ServiceResponse> services(@PathVariable String slug) {
        content.activeBusinessBySlug(slug);
        return services.publicServices(slug);
    }

    @GetMapping("/staff")
    public List<StaffResponse> staff(@PathVariable String slug) {
        content.activeBusinessBySlug(slug);
        return content.publicStaff(slug);
    }

    @GetMapping("/testimonials")
    public List<TestimonialResponse> testimonials(@PathVariable String slug) {
        content.activeBusinessBySlug(slug);
        return content.publicTestimonials(slug);
    }

    @PostMapping("/bookings")
    @ResponseStatus(HttpStatus.CREATED)
    public BookingResponse booking(@PathVariable String slug, @Valid @RequestBody BookingRequest request) {
        content.activeBusinessBySlug(slug);
        return bookings.createForBusiness(slug, request);
    }
}
