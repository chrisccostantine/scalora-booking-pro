package com.scalora.bookingpro.service;

import com.scalora.bookingpro.entity.Role;
import com.scalora.bookingpro.entity.User;
import com.scalora.bookingpro.exception.ApiException;
import com.scalora.bookingpro.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
public class AdminAccessService {
    private final UserRepository users;

    public AdminAccessService(UserRepository users) {
        this.users = users;
    }

    public User currentUser(Authentication authentication) {
        return users.findByEmail(authentication.getName())
            .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Admin user not found"));
    }

    public boolean isSuperAdmin(Authentication authentication) {
        Role role = currentUser(authentication).getRole();
        return role == Role.SUPER_ADMIN || role == Role.ADMIN;
    }

    public Long businessScope(Authentication authentication, Long requestedBusinessId) {
        User user = currentUser(authentication);
        if (user.getRole() == Role.SUPER_ADMIN || user.getRole() == Role.ADMIN) {
            return requestedBusinessId;
        }
        if (user.getBusiness() == null) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Business admin is not assigned to a business.");
        }
        Long allowedBusinessId = user.getBusiness().getId();
        if (requestedBusinessId != null && !allowedBusinessId.equals(requestedBusinessId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You can only manage your assigned business.");
        }
        return allowedBusinessId;
    }

    public Long requiredBusinessScope(Authentication authentication, Long requestedBusinessId) {
        Long businessId = businessScope(authentication, requestedBusinessId);
        if (businessId == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "businessId is required.");
        }
        return businessId;
    }

    public void requireSuperAdmin(Authentication authentication) {
        if (!isSuperAdmin(authentication)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Only the Scalora main admin can manage businesses.");
        }
    }
}
