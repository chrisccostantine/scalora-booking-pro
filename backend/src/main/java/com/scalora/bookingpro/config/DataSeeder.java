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

            if (services.count() == 0) {
                services.save(service("Signature Consultation", "A focused intake and tailored service plan.", 45, "65.00"));
                services.save(service("Premium Service Session", "The core appointment package for high-value clients.", 60, "95.00"));
                services.save(service("Follow-up Appointment", "Keep customers on track with a polished return visit.", 30, "45.00"));
            }

            if (staff.count() == 0) {
                Staff lead = new Staff();
                lead.setName("Alex Morgan");
                lead.setRole("Lead Specialist");
                lead.setEmail("alex@scalora.local");
                lead.setPhoneNumber("+1 555 0111");
                staff.save(lead);
            }

            if (testimonials.count() == 0) {
                testimonials.save(testimonial("Maya R.", "The booking experience felt effortless, and the reminder flow reduced no-shows immediately.", 5));
                testimonials.save(testimonial("Daniel K.", "Our team can finally manage appointments without spreadsheets or missed calls.", 5));
                testimonials.save(testimonial("Nour A.", "Clean, fast, and professional enough to use for multiple service brands.", 5));
            }

            if (!businessInfo.existsById(1L)) {
                BusinessInfo info = new BusinessInfo();
                info.setId(1L);
                info.setBusinessName("Scalora Booking Pro");
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

    private ServiceEntity service(String name, String description, int minutes, String price) {
        ServiceEntity service = new ServiceEntity();
        service.setName(name);
        service.setDescription(description);
        service.setDurationMinutes(minutes);
        service.setPrice(new BigDecimal(price));
        service.setActive(true);
        return service;
    }

    private Testimonial testimonial(String customerName, String content, int rating) {
        Testimonial testimonial = new Testimonial();
        testimonial.setCustomerName(customerName);
        testimonial.setContent(content);
        testimonial.setRating(rating);
        testimonial.setActive(true);
        return testimonial;
    }
}
