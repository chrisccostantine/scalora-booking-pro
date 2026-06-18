package com.scalora.bookingpro.config;

import com.scalora.bookingpro.entity.*;
import com.scalora.bookingpro.repository.*;
import java.math.BigDecimal;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataSeeder {
    @Bean
    CommandLineRunner seed(
        UserRepository users,
        ServiceRepository services,
        StaffRepository staff,
        TestimonialRepository testimonials,
        BusinessInfoRepository businessInfo,
        BusinessRepository businesses,
        PasswordEncoder encoder
    ) {
        return args -> {
            if (!users.existsByEmail("admin@scalora.local")) {
                User admin = new User();
                admin.setEmail("admin@scalora.local");
                admin.setPasswordHash(encoder.encode("Admin123!"));
                admin.setRole(Role.ADMIN);
                users.save(admin);
            }

            Business edgard = businesses.findBySlug("edgard-akar").orElseGet(() -> businesses.save(business("Edgard Akar", "edgard-akar", "Premium appointments for personal services.")));
            Business marka = businesses.findBySlug("marka-store").orElseGet(() -> businesses.save(business("Marka Store", "marka-store", "Retail consultations and customer appointments.")));
            Business clinic = businesses.findBySlug("clinic-name").orElseGet(() -> businesses.save(business("Clinic Name", "clinic-name", "Modern clinic scheduling and patient visits.")));

            if (services.count() == 0) {
                services.save(service(edgard, "Signature Consultation", "A focused intake and tailored service plan.", 45, "65.00"));
                services.save(service(edgard, "Premium Service Session", "The core appointment package for high-value clients.", 60, "95.00"));
                services.save(service(marka, "Personal Shopping Session", "A guided product selection appointment.", 40, "35.00"));
                services.save(service(clinic, "Initial Clinic Visit", "A structured first appointment with the care team.", 50, "75.00"));
            }

            if (staff.count() == 0) {
                Staff lead = new Staff();
                lead.setBusiness(edgard);
                lead.setName("Alex Morgan");
                lead.setRole("Lead Specialist");
                lead.setEmail("alex@scalora.local");
                lead.setPhoneNumber("+1 555 0111");
                staff.save(lead);
            }

            if (testimonials.count() == 0) {
                testimonials.save(testimonial(edgard, "Maya R.", "The booking experience felt effortless, and the reminder flow reduced no-shows immediately.", 5));
                testimonials.save(testimonial(marka, "Daniel K.", "Our team can finally manage appointments without spreadsheets or missed calls.", 5));
                testimonials.save(testimonial(clinic, "Nour A.", "Clean, fast, and professional enough to use for multiple service brands.", 5));
            }

            if (businessInfo.findByBusinessId(edgard.getId()).isEmpty()) {
                BusinessInfo info = new BusinessInfo();
                info.setBusiness(edgard);
                info.setBusinessName("Edgard Akar");
                info.setPhoneNumber("+1 555 0199");
                info.setWhatsappNumber("+15550199");
                info.setAddress("Downtown Business District");
                info.setOpeningHours("Mon - Sat, 9:00 AM - 7:00 PM");
                info.setFacebookUrl("https://facebook.com");
                info.setInstagramUrl("https://instagram.com");
                info.setLinkedinUrl("https://linkedin.com");
                businessInfo.save(info);
            }
        };
    }

    private Business business(String name, String slug, String tagline) {
        Business business = new Business();
        business.setName(name);
        business.setSlug(slug);
        business.setTagline(tagline);
        business.setActive(true);
        return business;
    }

    private ServiceEntity service(Business business, String name, String description, int minutes, String price) {
        ServiceEntity service = new ServiceEntity();
        service.setBusiness(business);
        service.setName(name);
        service.setDescription(description);
        service.setDurationMinutes(minutes);
        service.setPrice(new BigDecimal(price));
        service.setActive(true);
        return service;
    }

    private Testimonial testimonial(Business business, String customerName, String content, int rating) {
        Testimonial testimonial = new Testimonial();
        testimonial.setBusiness(business);
        testimonial.setCustomerName(customerName);
        testimonial.setContent(content);
        testimonial.setRating(rating);
        testimonial.setActive(true);
        return testimonial;
    }
}
