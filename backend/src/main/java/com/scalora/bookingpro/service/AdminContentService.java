package com.scalora.bookingpro.service;

import com.scalora.bookingpro.dto.AdminDtos.BusinessInfoRequest;
import com.scalora.bookingpro.dto.AdminDtos.BusinessInfoResponse;
import com.scalora.bookingpro.dto.AdminDtos.BusinessRequest;
import com.scalora.bookingpro.dto.AdminDtos.BusinessResponse;
import com.scalora.bookingpro.dto.AdminDtos.PlatformAnalyticsResponse;
import com.scalora.bookingpro.dto.AdminDtos.AdminUserRequest;
import com.scalora.bookingpro.dto.AdminDtos.AdminUserResponse;
import com.scalora.bookingpro.dto.AdminDtos.AvailabilityRequest;
import com.scalora.bookingpro.dto.AdminDtos.AvailabilityResponse;
import com.scalora.bookingpro.dto.AdminDtos.StaffRequest;
import com.scalora.bookingpro.dto.AdminDtos.StaffResponse;
import com.scalora.bookingpro.dto.AdminDtos.TestimonialRequest;
import com.scalora.bookingpro.dto.AdminDtos.TestimonialResponse;
import com.scalora.bookingpro.entity.Business;
import com.scalora.bookingpro.entity.BusinessAvailability;
import com.scalora.bookingpro.entity.BusinessInfo;
import com.scalora.bookingpro.entity.Booking;
import com.scalora.bookingpro.entity.BookingStatus;
import com.scalora.bookingpro.entity.Role;
import com.scalora.bookingpro.entity.Staff;
import com.scalora.bookingpro.entity.Testimonial;
import com.scalora.bookingpro.entity.User;
import com.scalora.bookingpro.exception.ApiException;
import com.scalora.bookingpro.repository.BusinessInfoRepository;
import com.scalora.bookingpro.repository.BusinessAvailabilityRepository;
import com.scalora.bookingpro.repository.BusinessRepository;
import com.scalora.bookingpro.repository.BookingRepository;
import com.scalora.bookingpro.repository.ContactMessageRepository;
import com.scalora.bookingpro.repository.ServiceRepository;
import com.scalora.bookingpro.repository.StaffRepository;
import com.scalora.bookingpro.repository.TestimonialRepository;
import com.scalora.bookingpro.repository.UserRepository;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminContentService {
    private final BusinessRepository businesses;
    private final BookingRepository bookings;
    private final ContactMessageRepository contactMessages;
    private final ServiceRepository services;
    private final StaffRepository staff;
    private final TestimonialRepository testimonials;
    private final BusinessInfoRepository businessInfo;
    private final BusinessAvailabilityRepository availability;
    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;

    public AdminContentService(BusinessRepository businesses, BookingRepository bookings, ContactMessageRepository contactMessages, ServiceRepository services, StaffRepository staff, TestimonialRepository testimonials, BusinessInfoRepository businessInfo, BusinessAvailabilityRepository availability, UserRepository users, PasswordEncoder passwordEncoder) {
        this.businesses = businesses;
        this.bookings = bookings;
        this.contactMessages = contactMessages;
        this.services = services;
        this.staff = staff;
        this.testimonials = testimonials;
        this.businessInfo = businessInfo;
        this.availability = availability;
        this.users = users;
        this.passwordEncoder = passwordEncoder;
    }

    public List<BusinessResponse> publicBusinesses() {
        return businesses.findByActiveTrueOrderByNameAsc().stream().map(this::businessResponse).toList();
    }

    public List<BusinessResponse> businesses() {
        return businesses.findAll().stream().map(this::businessResponse).toList();
    }

    public BusinessResponse businessBySlug(String slug) {
        return businessResponse(findBusiness(slug));
    }

    public BusinessResponse activeBusinessBySlug(String slug) {
        Business business = findBusiness(slug);
        if (!business.isActive()) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Business is unavailable.");
        }
        return businessResponse(business);
    }

    public BusinessResponse businessById(Long id) {
        return businessResponse(findBusiness(id));
    }

    @Transactional
    public BusinessResponse createBusiness(BusinessRequest request) {
        String slug = normalizeSlug(request.slug());
        if (businesses.existsBySlug(slug)) {
            throw new ApiException(HttpStatus.CONFLICT, "Business slug is already in use.");
        }
        Business business = new Business();
        apply(business, request);
        Business saved = businesses.save(business);
        syncInfo(saved);
        upsertOwnerAdminIfRequested(saved, request);
        return businessResponse(saved);
    }

    @Transactional
    public BusinessResponse updateBusiness(Long id, BusinessRequest request) {
        Business business = findBusiness(id);
        String slug = normalizeSlug(request.slug());
        if (!business.getSlug().equals(slug) && businesses.existsBySlug(slug)) {
            throw new ApiException(HttpStatus.CONFLICT, "Business slug is already in use.");
        }
        apply(business, request);
        Business saved = businesses.save(business);
        upsertOwnerAdminIfRequested(saved, request);
        return businessResponse(saved);
    }

    public BusinessResponse updateBusinessStatus(Long id, boolean active) {
        Business business = findBusiness(id);
        business.setActive(active);
        return businessResponse(businesses.save(business));
    }

    public PlatformAnalyticsResponse analytics() {
        List<Business> allBusinesses = businesses.findAll();
        List<Booking> allBookings = bookings.findAll();
        LocalDate today = LocalDate.now();
        Instant startOfMonth = today.withDayOfMonth(1).atStartOfDay(ZoneId.systemDefault()).toInstant();
        List<String> mostActive = allBusinesses.stream()
            .map(business -> business.getName() + " (" + allBookings.stream()
                .filter(booking -> booking.getService() != null
                    && booking.getService().getBusiness() != null
                    && business.getId().equals(booking.getService().getBusiness().getId()))
                .count() + ")")
            .limit(5)
            .toList();
        return new PlatformAnalyticsResponse(
            allBusinesses.size(),
            allBusinesses.stream().filter(Business::isActive).count(),
            allBusinesses.stream().filter(business -> !business.isActive()).count(),
            allBookings.stream().filter(booking -> today.equals(booking.getAppointmentDate())).count(),
            allBookings.stream().filter(booking -> booking.getStatus() == BookingStatus.PENDING).count(),
            allBookings.stream().filter(booking -> booking.getStatus() == BookingStatus.CONFIRMED).count(),
            allBookings.stream().filter(booking -> booking.getStatus() == BookingStatus.COMPLETED).count(),
            allBusinesses.stream().filter(business -> business.getCreatedAt() != null && !business.getCreatedAt().isBefore(startOfMonth)).count(),
            mostActive
        );
    }

    @Transactional
    public void deleteBusiness(Long id) {
        if (!businesses.existsById(id)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Business not found");
        }
        bookings.deleteByServiceBusinessId(id);
        availability.deleteByBusinessId(id);
        users.deleteByBusinessId(id);
        staff.deleteByBusinessId(id);
        testimonials.deleteByBusinessId(id);
        businessInfo.deleteByBusinessId(id);
        contactMessages.deleteByBusinessId(id);
        services.deleteByBusinessId(id);
        businesses.deleteById(id);
    }

    public List<AdminUserResponse> businessAdmins(Long businessId) {
        return users.findByBusinessIdOrderByEmailAsc(businessId).stream().map(this::adminUserResponse).toList();
    }

    public AdminUserResponse createBusinessAdmin(AdminUserRequest request) {
        if (users.existsByEmail(request.email())) {
            throw new ApiException(HttpStatus.CONFLICT, "Admin email is already in use.");
        }
        User user = new User();
        user.setEmail(request.email());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(Role.BUSINESS_ADMIN);
        user.setBusiness(findBusiness(request.businessId()));
        return adminUserResponse(users.save(user));
    }

    public List<AvailabilityResponse> availability(Long businessId) {
        return availability.findByBusinessIdOrderByDayOfWeekAscStartTimeAsc(businessId).stream().map(this::availabilityResponse).toList();
    }

    public AvailabilityResponse createAvailability(Long businessId, AvailabilityRequest request) {
        BusinessAvailability window = new BusinessAvailability();
        window.setBusiness(findBusiness(businessId));
        apply(window, request);
        return availabilityResponse(availability.save(window));
    }

    public AvailabilityResponse updateAvailability(Long id, AvailabilityRequest request, User user) {
        BusinessAvailability window = availability.findById(id)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Availability window not found"));
        requireAccess(window.getBusiness().getId(), user);
        apply(window, request);
        return availabilityResponse(availability.save(window));
    }

    public void deleteAvailability(Long id, User user) {
        BusinessAvailability window = availability.findById(id)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Availability window not found"));
        requireAccess(window.getBusiness().getId(), user);
        availability.deleteById(id);
    }

    public List<StaffResponse> staff(Long businessId) {
        return staff.findByBusinessIdOrderByNameAsc(businessId).stream().map(this::staffResponse).toList();
    }

    public List<StaffResponse> publicStaff(String slug) {
        return staff.findByBusinessSlugAndActiveTrueOrderByNameAsc(slug).stream().map(this::staffResponse).toList();
    }

    public StaffResponse createStaff(Long businessId, StaffRequest request) {
        Staff member = new Staff();
        member.setBusiness(findBusiness(businessId));
        apply(member, request);
        return staffResponse(staff.save(member));
    }

    public StaffResponse updateStaff(Long id, StaffRequest request) {
        Staff member = staff.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Staff member not found"));
        apply(member, request);
        return staffResponse(staff.save(member));
    }

    public StaffResponse updateStaff(Long id, StaffRequest request, User user) {
        Staff member = staff.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Staff member not found"));
        requireAccess(member.getBusiness().getId(), user);
        apply(member, request);
        return staffResponse(staff.save(member));
    }

    public void deleteStaff(Long id) {
        staff.deleteById(id);
    }

    public void deleteStaff(Long id, User user) {
        Staff member = staff.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Staff member not found"));
        requireAccess(member.getBusiness().getId(), user);
        staff.deleteById(id);
    }

    public List<TestimonialResponse> publicTestimonials(String slug) {
        return testimonials.findByBusinessSlugAndActiveTrue(slug).stream().map(this::testimonialResponse).toList();
    }

    public List<TestimonialResponse> testimonials(Long businessId) {
        return testimonials.findByBusinessIdOrderByCustomerNameAsc(businessId).stream().map(this::testimonialResponse).toList();
    }

    public TestimonialResponse createTestimonial(Long businessId, TestimonialRequest request) {
        Testimonial testimonial = new Testimonial();
        testimonial.setBusiness(findBusiness(businessId));
        apply(testimonial, request);
        return testimonialResponse(testimonials.save(testimonial));
    }

    public TestimonialResponse updateTestimonial(Long id, TestimonialRequest request) {
        Testimonial testimonial = testimonials.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Testimonial not found"));
        apply(testimonial, request);
        return testimonialResponse(testimonials.save(testimonial));
    }

    public TestimonialResponse updateTestimonial(Long id, TestimonialRequest request, User user) {
        Testimonial testimonial = testimonials.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Testimonial not found"));
        requireAccess(testimonial.getBusiness().getId(), user);
        apply(testimonial, request);
        return testimonialResponse(testimonials.save(testimonial));
    }

    public void deleteTestimonial(Long id) {
        testimonials.deleteById(id);
    }

    public void deleteTestimonial(Long id, User user) {
        Testimonial testimonial = testimonials.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Testimonial not found"));
        requireAccess(testimonial.getBusiness().getId(), user);
        testimonials.deleteById(id);
    }

    public BusinessInfoResponse getBusinessInfo(String slug) {
        return infoResponse(getOrCreateInfo(findBusiness(slug)));
    }

    public BusinessInfoResponse getBusinessInfo(Long businessId) {
        return infoResponse(getOrCreateInfo(findBusiness(businessId)));
    }

    public BusinessInfoResponse updateBusinessInfo(Long businessId, BusinessInfoRequest request) {
        Business business = findBusiness(businessId);
        BusinessInfo info = getOrCreateInfo(business);
        info.setBusinessName(request.businessName());
        info.setLogoUrl(request.logoUrl());
        info.setCoverImageUrl(request.coverImageUrl());
        info.setGalleryImageUrls(request.galleryImageUrls());
        info.setPhoneNumber(request.phoneNumber());
        info.setWhatsappNumber(request.whatsappNumber());
        info.setAddress(request.address());
        info.setOpeningHours(request.openingHours());
        info.setFacebookUrl(request.facebookUrl());
        info.setInstagramUrl(request.instagramUrl());
        info.setLinkedinUrl(request.linkedinUrl());
        business.setName(defaultIfBlank(request.businessName(), business.getName()));
        business.setLogoUrl(request.logoUrl());
        business.setCoverImageUrl(request.coverImageUrl());
        business.setGalleryImageUrls(request.galleryImageUrls());
        business.setPhone(request.phoneNumber());
        business.setWhatsappNumber(request.whatsappNumber());
        business.setAddress(request.address());
        business.setOpeningHours(request.openingHours());
        business.setFacebookUrl(request.facebookUrl());
        business.setInstagramUrl(request.instagramUrl());
        businesses.save(business);
        return infoResponse(businessInfo.save(info));
    }

    private Business findBusiness(Long id) {
        return businesses.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Business not found"));
    }

    private Business findBusiness(String slug) {
        return businesses.findBySlug(slug).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Business not found"));
    }

    private BusinessInfo getOrCreateInfo(Business business) {
        return businessInfo.findByBusinessId(business.getId()).orElseGet(() -> {
            BusinessInfo info = new BusinessInfo();
            info.setBusiness(business);
            info.setBusinessName(business.getName());
            return businessInfo.save(info);
        });
    }

    private void apply(Business business, BusinessRequest request) {
        business.setName(request.name());
        business.setSlug(normalizeSlug(request.slug()));
        business.setTagline(request.tagline());
        business.setDescription(request.description());
        business.setLogoUrl(request.logoUrl());
        business.setCoverImageUrl(request.coverImageUrl());
        business.setGalleryImageUrls(request.galleryImageUrls());
        business.setPrimaryColor(defaultIfBlank(request.primaryColor(), "#12756f"));
        business.setSecondaryColor(defaultIfBlank(request.secondaryColor(), "#eef6f4"));
        business.setAccentColor(defaultIfBlank(request.accentColor(), "#d85f4f"));
        business.setFontStyle(defaultIfBlank(request.fontStyle(), "Inter"));
        business.setButtonStyle(defaultIfBlank(request.buttonStyle(), "rounded"));
        business.setPhone(request.phone());
        business.setWhatsappNumber(request.whatsappNumber());
        business.setEmail(request.email());
        business.setAddress(request.address());
        business.setGoogleMapsUrl(request.googleMapsUrl());
        business.setOpeningHours(request.openingHours());
        business.setInstagramUrl(request.instagramUrl());
        business.setFacebookUrl(request.facebookUrl());
        business.setTiktokUrl(request.tiktokUrl());
        business.setOwnerName(request.ownerName());
        business.setOwnerEmail(request.ownerEmail());
        business.setActive(request.active());
        syncInfo(business);
    }

    private void upsertOwnerAdminIfRequested(Business business, BusinessRequest request) {
        if (request.ownerEmail() == null || request.ownerEmail().isBlank()) return;
        if (request.temporaryPassword() == null || request.temporaryPassword().isBlank()) return;
        User user = users.findByEmail(request.ownerEmail()).orElseGet(User::new);
        if (user.getId() != null && (user.getBusiness() == null || !business.getId().equals(user.getBusiness().getId()))) {
            throw new ApiException(HttpStatus.CONFLICT, "Business owner email is already in use.");
        }
        user.setEmail(request.ownerEmail());
        user.setPasswordHash(passwordEncoder.encode(request.temporaryPassword()));
        user.setRole(Role.BUSINESS_ADMIN);
        user.setBusiness(business);
        users.save(user);
    }

    private void apply(BusinessAvailability window, AvailabilityRequest request) {
        if (!request.endTime().isAfter(request.startTime())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "End time must be after start time.");
        }
        window.setDayOfWeek(request.dayOfWeek());
        window.setStartTime(request.startTime());
        window.setEndTime(request.endTime());
        window.setCapacity(request.capacity());
        window.setActive(request.active());
    }

    private String normalizeSlug(String slug) {
        return slug.toLowerCase().replaceAll("[^a-z0-9-]", "-").replaceAll("-+", "-").replaceAll("(^-|-$)", "");
    }

    private String defaultIfBlank(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }

    private void syncInfo(Business business) {
        if (business.getId() == null) return;
        BusinessInfo info = getOrCreateInfo(business);
        info.setBusinessName(business.getName());
        info.setLogoUrl(business.getLogoUrl());
        info.setCoverImageUrl(business.getCoverImageUrl());
        info.setGalleryImageUrls(business.getGalleryImageUrls());
        info.setPhoneNumber(business.getPhone());
        info.setWhatsappNumber(business.getWhatsappNumber());
        info.setAddress(business.getAddress());
        info.setOpeningHours(business.getOpeningHours());
        info.setFacebookUrl(business.getFacebookUrl());
        info.setInstagramUrl(business.getInstagramUrl());
        businessInfo.save(info);
    }

    private void requireAccess(Long businessId, User user) {
        if (user.getRole() == Role.SUPER_ADMIN || user.getRole() == Role.ADMIN) return;
        if (user.getBusiness() == null || !businessId.equals(user.getBusiness().getId())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You can only manage your assigned business.");
        }
    }

    private void apply(Staff member, StaffRequest request) {
        member.setName(request.name());
        member.setRole(request.role());
        member.setEmail(request.email());
        member.setPhoneNumber(request.phoneNumber());
        member.setActive(request.active());
    }

    private void apply(Testimonial testimonial, TestimonialRequest request) {
        testimonial.setCustomerName(request.customerName());
        testimonial.setContent(request.content());
        testimonial.setRating(request.rating());
        testimonial.setActive(request.active());
    }

    private BusinessResponse businessResponse(Business business) {
        return new BusinessResponse(
            business.getId(),
            business.getName(),
            business.getSlug(),
            business.getTagline(),
            business.getDescription(),
            business.getLogoUrl(),
            business.getCoverImageUrl(),
            business.getGalleryImageUrls(),
            business.getPrimaryColor(),
            business.getSecondaryColor(),
            business.getAccentColor(),
            business.getFontStyle(),
            business.getButtonStyle(),
            business.getPhone(),
            business.getPhone(),
            business.getWhatsappNumber(),
            business.getEmail(),
            business.getAddress(),
            business.getGoogleMapsUrl(),
            business.getOpeningHours(),
            business.getInstagramUrl(),
            business.getFacebookUrl(),
            business.getTiktokUrl(),
            business.getOwnerName(),
            business.getOwnerEmail(),
            business.isActive() ? "ACTIVE" : "INACTIVE",
            business.isActive(),
            business.getCreatedAt(),
            business.getUpdatedAt()
        );
    }

    private AdminUserResponse adminUserResponse(User user) {
        return new AdminUserResponse(
            user.getId(),
            user.getEmail(),
            user.getRole().name(),
            user.getBusiness() == null ? null : user.getBusiness().getId(),
            user.getBusiness() == null ? null : user.getBusiness().getName()
        );
    }

    private AvailabilityResponse availabilityResponse(BusinessAvailability window) {
        return new AvailabilityResponse(window.getId(), window.getDayOfWeek(), window.getStartTime(), window.getEndTime(), window.getCapacity(), window.isActive());
    }

    private StaffResponse staffResponse(Staff member) {
        return new StaffResponse(member.getId(), member.getName(), member.getRole(), member.getEmail(), member.getPhoneNumber(), member.isActive());
    }

    private TestimonialResponse testimonialResponse(Testimonial testimonial) {
        return new TestimonialResponse(testimonial.getId(), testimonial.getCustomerName(), testimonial.getContent(), testimonial.getRating(), testimonial.isActive());
    }

    private BusinessInfoResponse infoResponse(BusinessInfo info) {
        return new BusinessInfoResponse(
            info.getId(),
            info.getBusinessName(),
            info.getLogoUrl(),
            info.getCoverImageUrl(),
            info.getGalleryImageUrls(),
            info.getPhoneNumber(),
            info.getWhatsappNumber(),
            info.getAddress(),
            info.getOpeningHours(),
            info.getFacebookUrl(),
            info.getInstagramUrl(),
            info.getLinkedinUrl()
        );
    }
}
