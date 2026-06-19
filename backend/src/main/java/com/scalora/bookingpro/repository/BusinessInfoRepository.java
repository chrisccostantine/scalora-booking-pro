package com.scalora.bookingpro.repository;

import com.scalora.bookingpro.entity.BusinessInfo;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BusinessInfoRepository extends JpaRepository<BusinessInfo, Long> {
    Optional<BusinessInfo> findByBusinessId(Long businessId);
    Optional<BusinessInfo> findByBusinessSlug(String slug);
    void deleteByBusinessId(Long businessId);
}
