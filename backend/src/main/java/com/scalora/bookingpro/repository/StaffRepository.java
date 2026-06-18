package com.scalora.bookingpro.repository;

import com.scalora.bookingpro.entity.Staff;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StaffRepository extends JpaRepository<Staff, Long> {
    List<Staff> findByBusinessIdOrderByNameAsc(Long businessId);
    List<Staff> findByBusinessSlugAndActiveTrueOrderByNameAsc(String slug);
}
