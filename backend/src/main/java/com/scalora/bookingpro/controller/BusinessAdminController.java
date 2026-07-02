package com.scalora.bookingpro.controller;

import com.scalora.bookingpro.dto.AdminDtos.AvailabilityResponse;
import com.scalora.bookingpro.dto.AdminDtos.AvailabilityRequest;
import com.scalora.bookingpro.dto.AdminDtos.BusinessInfoRequest;
import com.scalora.bookingpro.dto.AdminDtos.BusinessInfoResponse;
import com.scalora.bookingpro.dto.AdminDtos.PasswordChangeRequest;
import com.scalora.bookingpro.dto.AdminDtos.StaffRequest;
import com.scalora.bookingpro.dto.AdminDtos.StaffResponse;
import com.scalora.bookingpro.dto.AdminDtos.TestimonialRequest;
import com.scalora.bookingpro.dto.AdminDtos.TestimonialResponse;
import com.scalora.bookingpro.dto.BookingDtos.BookingResponse;
import com.scalora.bookingpro.dto.BookingDtos.StatusUpdateRequest;
import com.scalora.bookingpro.dto.ServiceDtos.ServiceRequest;
import com.scalora.bookingpro.dto.ServiceDtos.ServiceResponse;
import com.scalora.bookingpro.entity.BookingStatus;
import com.scalora.bookingpro.service.AdminAccessService;
import com.scalora.bookingpro.service.AdminContentService;
import com.scalora.bookingpro.service.BookingService;
import com.scalora.bookingpro.service.ServiceCatalogService;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/business-admin")
public class BusinessAdminController {
    private final AdminAccessService access;
    private final AdminContentService content;
    private final BookingService bookings;
    private final ServiceCatalogService services;

    public BusinessAdminController(AdminAccessService access, AdminContentService content, BookingService bookings, ServiceCatalogService services) {
        this.access = access;
        this.content = content;
        this.bookings = bookings;
        this.services = services;
    }

    @GetMapping("/dashboard")
    public BusinessInfoResponse dashboard(Authentication authentication) {
        return content.getBusinessInfo(access.requiredBusinessScope(authentication, null));
    }

    @GetMapping("/bookings")
    public List<BookingResponse> bookings(
        @RequestParam(required = false) BookingStatus status,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
        @RequestParam(required = false) Long serviceId,
        Authentication authentication
    ) {
        return bookings.findAdmin(access.requiredBusinessScope(authentication, null), status, date, serviceId);
    }

    @PatchMapping("/bookings/{id}/status")
    public BookingResponse updateBooking(@PathVariable Long id, @Valid @RequestBody StatusUpdateRequest request, Authentication authentication) {
        return bookings.updateStatus(id, request.status(), access.currentUser(authentication));
    }

    @GetMapping("/services")
    public List<ServiceResponse> services(Authentication authentication) {
        return services.all(access.requiredBusinessScope(authentication, null));
    }

    @PostMapping("/services")
    @ResponseStatus(HttpStatus.CREATED)
    public ServiceResponse createService(@Valid @RequestBody ServiceRequest request, Authentication authentication) {
        return services.create(access.requiredBusinessScope(authentication, null), request);
    }

    @PutMapping("/services/{id}")
    public ServiceResponse updateService(@PathVariable Long id, @Valid @RequestBody ServiceRequest request, Authentication authentication) {
        return services.update(id, request, access.currentUser(authentication));
    }

    @DeleteMapping("/services/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteService(@PathVariable Long id, Authentication authentication) {
        services.delete(id, access.currentUser(authentication));
    }

    @GetMapping("/staff")
    public List<StaffResponse> staff(Authentication authentication) {
        return content.staff(access.requiredBusinessScope(authentication, null));
    }

    @PostMapping("/staff")
    @ResponseStatus(HttpStatus.CREATED)
    public StaffResponse createStaff(@Valid @RequestBody StaffRequest request, Authentication authentication) {
        return content.createStaff(access.requiredBusinessScope(authentication, null), request);
    }

    @PutMapping("/staff/{id}")
    public StaffResponse updateStaff(@PathVariable Long id, @Valid @RequestBody StaffRequest request, Authentication authentication) {
        return content.updateStaff(id, request, access.currentUser(authentication));
    }

    @DeleteMapping("/staff/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteStaff(@PathVariable Long id, Authentication authentication) {
        content.deleteStaff(id, access.currentUser(authentication));
    }

    @GetMapping("/testimonials")
    public List<TestimonialResponse> testimonials(Authentication authentication) {
        return content.testimonials(access.requiredBusinessScope(authentication, null));
    }

    @PostMapping("/testimonials")
    @ResponseStatus(HttpStatus.CREATED)
    public TestimonialResponse createTestimonial(@Valid @RequestBody TestimonialRequest request, Authentication authentication) {
        return content.createTestimonial(access.requiredBusinessScope(authentication, null), request);
    }

    @PutMapping("/testimonials/{id}")
    public TestimonialResponse updateTestimonial(@PathVariable Long id, @Valid @RequestBody TestimonialRequest request, Authentication authentication) {
        return content.updateTestimonial(id, request, access.currentUser(authentication));
    }

    @DeleteMapping("/testimonials/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTestimonial(@PathVariable Long id, Authentication authentication) {
        content.deleteTestimonial(id, access.currentUser(authentication));
    }

    @GetMapping("/availability")
    public List<AvailabilityResponse> availability(Authentication authentication) {
        return content.availability(access.requiredBusinessScope(authentication, null));
    }

    @PostMapping("/availability")
    @ResponseStatus(HttpStatus.CREATED)
    public AvailabilityResponse createAvailability(@Valid @RequestBody AvailabilityRequest request, Authentication authentication) {
        return content.createAvailability(access.requiredBusinessScope(authentication, null), request);
    }

    @PutMapping("/availability/{id}")
    public AvailabilityResponse updateAvailability(@PathVariable Long id, @Valid @RequestBody AvailabilityRequest request, Authentication authentication) {
        return content.updateAvailability(id, request, access.currentUser(authentication));
    }

    @DeleteMapping("/availability/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteAvailability(@PathVariable Long id, Authentication authentication) {
        content.deleteAvailability(id, access.currentUser(authentication));
    }

    @PutMapping("/business-settings")
    public BusinessInfoResponse settings(@RequestBody BusinessInfoRequest request, Authentication authentication) {
        return content.updateBusinessInfo(access.requiredBusinessScope(authentication, null), request);
    }

    @PutMapping("/password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void changePassword(@Valid @RequestBody PasswordChangeRequest request, Authentication authentication) {
        content.changeCurrentUserPassword(access.currentUser(authentication), request.currentPassword(), request.newPassword());
    }
}
