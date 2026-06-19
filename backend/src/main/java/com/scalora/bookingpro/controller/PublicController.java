package com.scalora.bookingpro.controller;

import com.scalora.bookingpro.dto.AdminDtos.BusinessInfoResponse;
import com.scalora.bookingpro.dto.AdminDtos.BusinessResponse;
import com.scalora.bookingpro.dto.AdminDtos.StaffResponse;
import com.scalora.bookingpro.dto.AdminDtos.TestimonialResponse;
import com.scalora.bookingpro.dto.BookingDtos.AvailabilitySlotResponse;
import com.scalora.bookingpro.dto.BookingDtos.BookingRequest;
import com.scalora.bookingpro.dto.BookingDtos.BookingResponse;
import com.scalora.bookingpro.dto.ContactDtos.ContactRequest;
import com.scalora.bookingpro.dto.ContactDtos.ContactResponse;
import com.scalora.bookingpro.dto.ServiceDtos.ServiceResponse;
import com.scalora.bookingpro.service.AdminContentService;
import com.scalora.bookingpro.service.BookingService;
import com.scalora.bookingpro.service.ContactService;
import com.scalora.bookingpro.service.ServiceCatalogService;
import jakarta.validation.Valid;
import java.util.List;
import java.time.LocalDate;
import org.springframework.http.HttpStatus;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class PublicController {
    private final ServiceCatalogService serviceCatalog;
    private final BookingService bookings;
    private final AdminContentService content;
    private final ContactService contact;

    public PublicController(ServiceCatalogService serviceCatalog, BookingService bookings, AdminContentService content, ContactService contact) {
        this.serviceCatalog = serviceCatalog;
        this.bookings = bookings;
        this.content = content;
        this.contact = contact;
    }

    @GetMapping("/services")
    public List<ServiceResponse> services() {
        return serviceCatalog.publicServices();
    }

    @GetMapping("/businesses")
    public List<BusinessResponse> businesses() {
        return content.publicBusinesses();
    }

    @GetMapping("/businesses/{slug}")
    public BusinessResponse business(@PathVariable String slug) {
        return content.businessBySlug(slug);
    }

    @GetMapping("/businesses/{slug}/services")
    public List<ServiceResponse> businessServices(@PathVariable String slug) {
        return serviceCatalog.publicServices(slug);
    }

    @GetMapping("/businesses/{slug}/staff")
    public List<StaffResponse> businessStaff(@PathVariable String slug) {
        return content.publicStaff(slug);
    }

    @GetMapping("/businesses/{slug}/availability-slots")
    public List<AvailabilitySlotResponse> availabilitySlots(
        @PathVariable String slug,
        @RequestParam Long serviceId,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        content.businessBySlug(slug);
        return bookings.availableSlots(serviceId, date);
    }

    @PostMapping("/bookings")
    @ResponseStatus(HttpStatus.CREATED)
    public BookingResponse createBooking(@Valid @RequestBody BookingRequest request) {
        return bookings.create(request);
    }

    @GetMapping("/testimonials")
    public List<TestimonialResponse> testimonials() {
        return List.of();
    }

    @GetMapping("/businesses/{slug}/testimonials")
    public List<TestimonialResponse> businessTestimonials(@PathVariable String slug) {
        return content.publicTestimonials(slug);
    }

    @GetMapping("/business-info")
    public BusinessInfoResponse businessInfo() {
        return new BusinessInfoResponse(
            null,
            "Scalora Booking Pro",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            ""
        );
    }

    @GetMapping("/businesses/{slug}/business-info")
    public BusinessInfoResponse businessInfo(@PathVariable String slug) {
        return content.getBusinessInfo(slug);
    }

    @PostMapping("/contact")
    @ResponseStatus(HttpStatus.CREATED)
    public ContactResponse contact(@Valid @RequestBody ContactRequest request) {
        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Use a business profile contact endpoint.");
    }

    @PostMapping("/businesses/{slug}/contact")
    @ResponseStatus(HttpStatus.CREATED)
    public ContactResponse contact(@PathVariable String slug, @Valid @RequestBody ContactRequest request) {
        return this.contact.create(slug, request);
    }
}
