package com.scalora.bookingpro.controller;

import com.scalora.bookingpro.dto.AdminDtos.BusinessInfoRequest;
import com.scalora.bookingpro.dto.AdminDtos.BusinessInfoResponse;
import com.scalora.bookingpro.dto.AdminDtos.StaffRequest;
import com.scalora.bookingpro.dto.AdminDtos.StaffResponse;
import com.scalora.bookingpro.dto.AdminDtos.TestimonialRequest;
import com.scalora.bookingpro.dto.AdminDtos.TestimonialResponse;
import com.scalora.bookingpro.dto.BookingDtos.BookingResponse;
import com.scalora.bookingpro.dto.BookingDtos.StatusUpdateRequest;
import com.scalora.bookingpro.dto.ServiceDtos.ServiceRequest;
import com.scalora.bookingpro.dto.ServiceDtos.ServiceResponse;
import com.scalora.bookingpro.entity.BookingStatus;
import com.scalora.bookingpro.service.AdminContentService;
import com.scalora.bookingpro.service.BookingService;
import com.scalora.bookingpro.service.ServiceCatalogService;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private final BookingService bookings;
    private final ServiceCatalogService serviceCatalog;
    private final AdminContentService content;

    public AdminController(BookingService bookings, ServiceCatalogService serviceCatalog, AdminContentService content) {
        this.bookings = bookings;
        this.serviceCatalog = serviceCatalog;
        this.content = content;
    }

    @GetMapping("/bookings")
    public List<BookingResponse> bookings(
        @RequestParam(required = false) BookingStatus status,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
        @RequestParam(required = false) Long serviceId
    ) {
        return bookings.findAdmin(status, date, serviceId);
    }

    @PatchMapping("/bookings/{id}/status")
    public BookingResponse updateStatus(@PathVariable Long id, @Valid @RequestBody StatusUpdateRequest request) {
        return bookings.updateStatus(id, request.status());
    }

    @GetMapping("/services")
    public List<ServiceResponse> services() {
        return serviceCatalog.all();
    }

    @PostMapping("/services")
    @ResponseStatus(HttpStatus.CREATED)
    public ServiceResponse createService(@Valid @RequestBody ServiceRequest request) {
        return serviceCatalog.create(request);
    }

    @PutMapping("/services/{id}")
    public ServiceResponse updateService(@PathVariable Long id, @Valid @RequestBody ServiceRequest request) {
        return serviceCatalog.update(id, request);
    }

    @DeleteMapping("/services/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteService(@PathVariable Long id) {
        serviceCatalog.delete(id);
    }

    @GetMapping("/staff")
    public List<StaffResponse> staff() {
        return content.staff();
    }

    @PostMapping("/staff")
    @ResponseStatus(HttpStatus.CREATED)
    public StaffResponse createStaff(@Valid @RequestBody StaffRequest request) {
        return content.createStaff(request);
    }

    @PutMapping("/staff/{id}")
    public StaffResponse updateStaff(@PathVariable Long id, @Valid @RequestBody StaffRequest request) {
        return content.updateStaff(id, request);
    }

    @DeleteMapping("/staff/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteStaff(@PathVariable Long id) {
        content.deleteStaff(id);
    }

    @PostMapping("/testimonials")
    @ResponseStatus(HttpStatus.CREATED)
    public TestimonialResponse createTestimonial(@Valid @RequestBody TestimonialRequest request) {
        return content.createTestimonial(request);
    }

    @PutMapping("/testimonials/{id}")
    public TestimonialResponse updateTestimonial(@PathVariable Long id, @Valid @RequestBody TestimonialRequest request) {
        return content.updateTestimonial(id, request);
    }

    @DeleteMapping("/testimonials/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTestimonial(@PathVariable Long id) {
        content.deleteTestimonial(id);
    }

    @PutMapping("/business-info")
    public BusinessInfoResponse updateBusinessInfo(@RequestBody BusinessInfoRequest request) {
        return content.updateBusinessInfo(request);
    }
}
