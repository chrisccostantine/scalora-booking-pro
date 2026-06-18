package com.scalora.bookingpro.repository;

import com.scalora.bookingpro.entity.Business;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BusinessRepository extends JpaRepository<Business, Long> {
    Optional<Business> findBySlug(String slug);
    boolean existsBySlug(String slug);
    List<Business> findByActiveTrueOrderByNameAsc();
}
