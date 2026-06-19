package com.scalora.bookingpro.repository;

import com.scalora.bookingpro.entity.BusinessAvailability;
import java.time.DayOfWeek;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BusinessAvailabilityRepository extends JpaRepository<BusinessAvailability, Long> {
    List<BusinessAvailability> findByBusinessIdOrderByDayOfWeekAscStartTimeAsc(Long businessId);
    List<BusinessAvailability> findByBusinessIdAndDayOfWeekAndActiveTrueOrderByStartTimeAsc(Long businessId, DayOfWeek dayOfWeek);
}
