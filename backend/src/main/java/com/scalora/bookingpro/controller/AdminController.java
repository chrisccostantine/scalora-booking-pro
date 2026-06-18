package com.scalora.bookingpro.controller;

import com.scalora.bookingpro.dto.AdminDtos.BusinessInfoRequest;
import com.scalora.bookingpro.dto.AdminDtos.BusinessInfoResponse;
import com.scalora.bookingpro.dto.AdminDtos.BusinessRequest;
import com.scalora.bookingpro.dto.AdminDtos.BusinessResponse;
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
@RequestMapping("/api/admin")
public class AdminController {
    private final BookingService bookings;
    private final ServiceCatalogService serviceCatalog;
    private final AdminContentService content;
    private final AdminAccessService access;

    public AdminController(BookingService bookings, ServiceCatalogService serviceCatalog, AdminContentService content, AdminAccessService access) {
        this.bookings = bookings;
        this.serviceCatalog = serviceCatalog;
        this.content = content;
        this.access = access;
    }

    @GetMapping("/bookings")
    public List<BookingResponse> bookings(
        @RequestParam(required = false) Long businessId,
        @RequestParam(required = false) BookingStatus status,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
        @RequestParam(required = false) Long serviceId,
        Authentication authentication
    ) {
        return bookings.findAdmin(access.businessScope(authentication, businessId), status, date, serviceId);
    }

    @PatchMapping("/bookings/{id}/status")
    public BookingResponse updateStatus(@PathVariable Long id, @Valid @RequestBody StatusUpdateRequest request, Authentication authentication) {
        return bookings.updateStatus(id, request.status(), access.currentUser(authentication));
    }

    @GetMapping("/businesses")
    public List<BusinessResponse> businesses(Authentication authentication) {
        if (!access.isSuperAdmin(authentication)) {
            Long businessId = access.requiredBusinessScope(authentication, null);
            return List.of(content.businessById(businessId));
        }
        return content.businesses();
    }

    @PostMapping("/businesses")
    @ResponseStatus(HttpStatus.CREATED)
    public BusinessResponse createBusiness(@Valid @RequestBody BusinessRequest request, Authentication authentication) {
        access.requireSuperAdmin(authentication);
        return content.createBusiness(request);
    }

    @PutMapping("/businesses/{id}")
    public BusinessResponse updateBusiness(@PathVariable Long id, @Valid @RequestBody BusinessRequest request, Authentication authentication) {
        access.requireSuperAdmin(authentication);
        return content.updateBusiness(id, request);
    }

    @GetMapping("/services")
    public List<ServiceResponse> services(@RequestParam(required = false) Long businessId, Authentication authentication) {
        return serviceCatalog.all(access.businessScope(authentication, businessId));
    }

    @PostMapping("/services")
    @ResponseStatus(HttpStatus.CREATED)
    public ServiceResponse createService(@RequestParam(required = false) Long businessId, @Valid @RequestBody ServiceRequest request, Authentication authentication) {
        return serviceCatalog.create(access.requiredBusinessScope(authentication, businessId), request);
    }

    @PutMapping("/services/{id}")
    public ServiceResponse updateService(@PathVariable Long id, @Valid @RequestBody ServiceRequest request, Authentication authentication) {
        return serviceCatalog.update(id, request, access.currentUser(authentication));
    }

    @DeleteMapping("/services/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteService(@PathVariable Long id, Authentication authentication) {
        serviceCatalog.delete(id, access.currentUser(authentication));
    }

    @GetMapping("/staff")
    public List<StaffResponse> staff(@RequestParam(required = false) Long businessId, Authentication authentication) {
        return content.staff(access.requiredBusinessScope(authentication, businessId));
    }

    @PostMapping("/staff")
    @ResponseStatus(HttpStatus.CREATED)
    public StaffResponse createStaff(@RequestParam(required = false) Long businessId, @Valid @RequestBody StaffRequest request, Authentication authentication) {
        return content.createStaff(access.requiredBusinessScope(authentication, businessId), request);
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
    public List<TestimonialResponse> testimonials(@RequestParam(required = false) Long businessId, Authentication authentication) {
        return content.testimonials(access.requiredBusinessScope(authentication, businessId));
    }

    @PostMapping("/testimonials")
    @ResponseStatus(HttpStatus.CREATED)
    public TestimonialResponse createTestimonial(@RequestParam(required = false) Long businessId, @Valid @RequestBody TestimonialRequest request, Authentication authentication) {
        return content.createTestimonial(access.requiredBusinessScope(authentication, businessId), request);
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

    @GetMapping("/business-info")
    public BusinessInfoResponse businessInfo(@RequestParam(required = false) Long businessId, Authentication authentication) {
        return content.getBusinessInfo(access.requiredBusinessScope(authentication, businessId));
    }

    @PutMapping("/business-info")
    public BusinessInfoResponse updateBusinessInfo(@RequestParam(required = false) Long businessId, @RequestBody BusinessInfoRequest request, Authentication authentication) {
        return content.updateBusinessInfo(access.requiredBusinessScope(authentication, businessId), request);
    }
}
