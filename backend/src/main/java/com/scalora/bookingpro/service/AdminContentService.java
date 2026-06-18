package com.scalora.bookingpro.service;

import com.scalora.bookingpro.dto.AdminDtos.BusinessInfoRequest;
import com.scalora.bookingpro.dto.AdminDtos.BusinessInfoResponse;
import com.scalora.bookingpro.dto.AdminDtos.StaffRequest;
import com.scalora.bookingpro.dto.AdminDtos.StaffResponse;
import com.scalora.bookingpro.dto.AdminDtos.TestimonialRequest;
import com.scalora.bookingpro.dto.AdminDtos.TestimonialResponse;
import com.scalora.bookingpro.entity.BusinessInfo;
import com.scalora.bookingpro.entity.Staff;
import com.scalora.bookingpro.entity.Testimonial;
import com.scalora.bookingpro.exception.ApiException;
import com.scalora.bookingpro.repository.BusinessInfoRepository;
import com.scalora.bookingpro.repository.StaffRepository;
import com.scalora.bookingpro.repository.TestimonialRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class AdminContentService {
    private final StaffRepository staff;
    private final TestimonialRepository testimonials;
    private final BusinessInfoRepository businessInfo;

    public AdminContentService(StaffRepository staff, TestimonialRepository testimonials, BusinessInfoRepository businessInfo) {
        this.staff = staff;
        this.testimonials = testimonials;
        this.businessInfo = businessInfo;
    }

    public List<StaffResponse> staff() {
        return staff.findAll().stream().map(this::staffResponse).toList();
    }

    public StaffResponse createStaff(StaffRequest request) {
        Staff member = new Staff();
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

    public List<TestimonialResponse> publicTestimonials() {
        return testimonials.findByActiveTrue().stream().map(this::testimonialResponse).toList();
    }

    public TestimonialResponse createTestimonial(TestimonialRequest request) {
        Testimonial testimonial = new Testimonial();
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

    public BusinessInfoResponse getBusinessInfo() {
        return infoResponse(getOrCreateInfo());
    }

    public BusinessInfoResponse updateBusinessInfo(BusinessInfoRequest request) {
        BusinessInfo info = getOrCreateInfo();
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

    private BusinessInfo getOrCreateInfo() {
        return businessInfo.findById(1L).orElseGet(() -> {
            BusinessInfo info = new BusinessInfo();
            info.setBusinessName("Scalora Booking Pro");
            return businessInfo.save(info);
        });
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
