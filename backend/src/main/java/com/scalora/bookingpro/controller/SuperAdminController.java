package com.scalora.bookingpro.controller;

import com.scalora.bookingpro.dto.AdminDtos.BusinessRequest;
import com.scalora.bookingpro.dto.AdminDtos.BusinessResponse;
import com.scalora.bookingpro.dto.AdminDtos.OwnerPasswordResetRequest;
import com.scalora.bookingpro.dto.AdminDtos.OwnerPasswordResetResponse;
import com.scalora.bookingpro.dto.AdminDtos.PlatformAnalyticsResponse;
import com.scalora.bookingpro.service.AdminAccessService;
import com.scalora.bookingpro.service.AdminContentService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/super-admin")
public class SuperAdminController {
    private final AdminContentService content;
    private final AdminAccessService access;

    public SuperAdminController(AdminContentService content, AdminAccessService access) {
        this.content = content;
        this.access = access;
    }

    @GetMapping("/businesses")
    public List<BusinessResponse> businesses(Authentication authentication) {
        access.requireSuperAdmin(authentication);
        return content.businesses();
    }

    @GetMapping("/businesses/{id}")
    public BusinessResponse business(@PathVariable Long id, Authentication authentication) {
        access.requireSuperAdmin(authentication);
        return content.businessById(id);
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

    @PatchMapping("/businesses/{id}/status")
    public BusinessResponse updateStatus(@PathVariable Long id, @RequestBody StatusRequest request, Authentication authentication) {
        access.requireSuperAdmin(authentication);
        return content.updateBusinessStatus(id, request.active());
    }

    @PatchMapping("/businesses/{id}/owner-password")
    public OwnerPasswordResetResponse resetOwnerPassword(@PathVariable Long id, @Valid @RequestBody OwnerPasswordResetRequest request, Authentication authentication) {
        access.requireSuperAdmin(authentication);
        return content.resetOwnerPassword(id, request.password());
    }

    @DeleteMapping("/businesses/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteBusiness(@PathVariable Long id, Authentication authentication) {
        access.requireSuperAdmin(authentication);
        content.deleteBusiness(id);
    }

    @GetMapping("/analytics")
    public PlatformAnalyticsResponse analytics(Authentication authentication) {
        access.requireSuperAdmin(authentication);
        return content.analytics();
    }

    public record StatusRequest(boolean active) {}
}
