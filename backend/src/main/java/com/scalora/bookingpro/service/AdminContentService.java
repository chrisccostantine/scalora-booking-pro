package com.scalora.bookingpro.service;

import com.scalora.bookingpro.dto.AdminDtos.BusinessInfoRequest;
import com.scalora.bookingpro.dto.AdminDtos.BusinessInfoResponse;
import com.scalora.bookingpro.dto.AdminDtos.BusinessRequest;
import com.scalora.bookingpro.dto.AdminDtos.BusinessResponse;
import com.scalora.bookingpro.dto.AdminDtos.StaffRequest;
import com.scalora.bookingpro.dto.AdminDtos.StaffResponse;
import com.scalora.bookingpro.dto.AdminDtos.TestimonialRequest;
import com.scalora.bookingpro.dto.AdminDtos.TestimonialResponse;
import com.scalora.bookingpro.entity.Business;
import com.scalora.bookingpro.entity.BusinessInfo;
import com.scalora.bookingpro.entity.Staff;
import com.scalora.bookingpro.entity.Testimonial;
import com.scalora.bookingpro.exception.ApiException;
import com.scalora.bookingpro.repository.BusinessInfoRepository;
import com.scalora.bookingpro.repository.BusinessRepository;
import com.scalora.bookingpro.repository.StaffRepository;
import com.scalora.bookingpro.repository.TestimonialRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class AdminContentService {
    private final BusinessRepository businesses;
    private final StaffRepository staff;
    private final TestimonialRepository testimonials;
    private final BusinessInfoRepository businessInfo;

    public AdminContentService(BusinessRepository businesses, StaffRepository staff, TestimonialRepository testimonials, BusinessInfoRepository businessInfo) {
        this.businesses = businesses;
        this.staff = staff;
        this.testimonials = testimonials;
        this.businessInfo = businessInfo;
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

    public BusinessResponse createBusiness(BusinessRequest request) {
        String slug = normalizeSlug(request.slug());
        if (businesses.existsBySlug(slug)) {
            throw new ApiException(HttpStatus.CONFLICT, "Business slug is already in use.");
        }
        Business business = new Business();
        apply(business, request);
        Business saved = businesses.save(business);
        getOrCreateInfo(saved);
        return businessResponse(saved);
    }

    public BusinessResponse updateBusiness(Long id, BusinessRequest request) {
        Business business = findBusiness(id);
        String slug = normalizeSlug(request.slug());
        if (!business.getSlug().equals(slug) && businesses.existsBySlug(slug)) {
            throw new ApiException(HttpStatus.CONFLICT, "Business slug is already in use.");
        }
        apply(business, request);
        return businessResponse(businesses.save(business));
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

    public void deleteStaff(Long id) {
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

    public void deleteTestimonial(Long id) {
        testimonials.deleteById(id);
    }

    public BusinessInfoResponse getBusinessInfo(String slug) {
        return infoResponse(getOrCreateInfo(findBusiness(slug)));
    }

    public BusinessInfoResponse getBusinessInfo(Long businessId) {
        return infoResponse(getOrCreateInfo(findBusiness(businessId)));
    }

    public BusinessInfoResponse updateBusinessInfo(Long businessId, BusinessInfoRequest request) {
        BusinessInfo info = getOrCreateInfo(findBusiness(businessId));
        info.setBusinessName(request.businessName());
        info.setLogoUrl(request.logoUrl());
        info.setPhoneNumber(request.phoneNumber());
        info.setWhatsappNumber(request.whatsappNumber());
        info.setAddress(request.address());
        info.setOpeningHours(request.openingHours());
        info.setFacebookUrl(request.facebookUrl());
        info.setInstagramUrl(request.instagramUrl());
        info.setLinkedinUrl(request.linkedinUrl());
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
        business.setActive(request.active());
    }

    private String normalizeSlug(String slug) {
        return slug.toLowerCase().replaceAll("[^a-z0-9-]", "-").replaceAll("-+", "-").replaceAll("(^-|-$)", "");
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
        return new BusinessResponse(business.getId(), business.getName(), business.getSlug(), business.getTagline(), business.isActive());
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
