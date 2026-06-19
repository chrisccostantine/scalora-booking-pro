package com.scalora.bookingpro.config;

import com.scalora.bookingpro.entity.*;
import com.scalora.bookingpro.repository.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
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
        PasswordEncoder encoder,
        JdbcTemplate jdbc,
        @Value("${app.super-admin.email:admin@scalora.local}") String superAdminEmail,
        @Value("${app.super-admin.password:}") String superAdminPassword
    ) {
        return args -> {
            dropLegacyBookingUniqueConstraint(jdbc);

            String password = superAdminPassword == null || superAdminPassword.isBlank()
                ? "ChangeMeBeforeProduction123!"
                : superAdminPassword;

            User admin = users.findByEmail(superAdminEmail).orElseGet(User::new);
            admin.setEmail(superAdminEmail);
            admin.setPasswordHash(encoder.encode(password));
            admin.setRole(Role.SUPER_ADMIN);
            admin.setBusiness(null);
            users.save(admin);

            if (!"admin@scalora.local".equalsIgnoreCase(superAdminEmail)) {
                deleteDemoAccount(users, "admin@scalora.local");
            }
            deleteDemoAccount(users, "admin@edgard-akar.local");
            deleteDemoAccount(users, "admin@marka-store.local");
            deleteDemoAccount(users, "admin@clinic-name.local");

            Business fallback = businesses.findBySlug("edgard-akar").orElseGet(() -> businesses.findAll().stream().findFirst().orElse(null));
            if (fallback != null) {
                services.findAll().stream()
                    .filter(service -> service.getBusiness() == null)
                    .forEach(service -> {
                        service.setBusiness(fallback);
                        services.save(service);
                    });
                staff.findAll().stream()
                    .filter(member -> member.getBusiness() == null)
                    .forEach(member -> {
                        member.setBusiness(fallback);
                        staff.save(member);
                    });
                testimonials.findAll().stream()
                    .filter(testimonial -> testimonial.getBusiness() == null)
                    .forEach(testimonial -> {
                        testimonial.setBusiness(fallback);
                        testimonials.save(testimonial);
                    });
                businessInfo.findAll().stream()
                    .filter(info -> info.getBusiness() == null)
                    .forEach(info -> {
                        info.setBusiness(fallback);
                        businessInfo.save(info);
                    });
            }
        };
    }

    private void deleteDemoAccount(UserRepository users, String email) {
        users.findByEmail(email).ifPresent(users::delete);
    }

    private void dropLegacyBookingUniqueConstraint(JdbcTemplate jdbc) {
        try {
            jdbc.execute("""
                DO $$
                DECLARE constraint_name text;
                BEGIN
                  FOR constraint_name IN
                    SELECT con.conname
                    FROM pg_constraint con
                    JOIN pg_class rel ON rel.oid = con.conrelid
                    JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
                    WHERE rel.relname = 'bookings'
                      AND con.contype = 'u'
                      AND pg_get_constraintdef(con.oid) LIKE '%service_id%'
                      AND pg_get_constraintdef(con.oid) LIKE '%appointment_date%'
                      AND pg_get_constraintdef(con.oid) LIKE '%appointment_time%'
                  LOOP
                    EXECUTE format('ALTER TABLE bookings DROP CONSTRAINT IF EXISTS %I', constraint_name);
                  END LOOP;
                END $$;
                """);
        } catch (Exception ignored) {
            // Non-PostgreSQL local databases do not support DO blocks.
        }
    }
}
