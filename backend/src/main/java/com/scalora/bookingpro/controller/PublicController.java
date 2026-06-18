package com.scalora.bookingpro.controller;

import com.scalora.bookingpro.dto.AdminDtos.BusinessInfoResponse;
import com.scalora.bookingpro.dto.AdminDtos.TestimonialResponse;
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
import org.springframework.http.HttpStatus;
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

    @PostMapping("/bookings")
    @ResponseStatus(HttpStatus.CREATED)
    public BookingResponse createBooking(@Valid @RequestBody BookingRequest request) {
        return bookings.create(request);
    }

    @GetMapping("/testimonials")
    public List<TestimonialResponse> testimonials() {
        return content.publicTestimonials();
    }

    @GetMapping("/business-info")
    public BusinessInfoResponse businessInfo() {
        return content.getBusinessInfo();
    }

    @PostMapping("/contact")
    @ResponseStatus(HttpStatus.CREATED)
    public ContactResponse contact(@Valid @RequestBody ContactRequest request) {
        return this.contact.create(request);
    }
}
