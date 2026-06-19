package com.scalora.bookingpro.repository;

import com.scalora.bookingpro.entity.ServiceEntity;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ServiceRepository extends JpaRepository<ServiceEntity, Long> {
    List<ServiceEntity> findByActiveTrueOrderByNameAsc();
    List<ServiceEntity> findByBusinessIdOrderByNameAsc(Long businessId);
    List<ServiceEntity> findByBusinessSlugAndActiveTrueOrderByNameAsc(String slug);
    void deleteByBusinessId(Long businessId);
}
