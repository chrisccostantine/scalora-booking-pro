package com.scalora.bookingpro.repository;

import com.scalora.bookingpro.entity.Testimonial;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TestimonialRepository extends JpaRepository<Testimonial, Long> {
    List<Testimonial> findByActiveTrue();
    List<Testimonial> findByBusinessSlugAndActiveTrue(String slug);
    List<Testimonial> findByBusinessIdOrderByCustomerNameAsc(Long businessId);
    void deleteByBusinessId(Long businessId);
}
