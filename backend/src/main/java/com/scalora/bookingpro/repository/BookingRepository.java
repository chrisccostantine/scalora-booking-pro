package com.scalora.bookingpro.repository;

import com.scalora.bookingpro.entity.Booking;
import com.scalora.bookingpro.entity.BookingStatus;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface BookingRepository extends JpaRepository<Booking, Long>, JpaSpecificationExecutor<Booking> {
    boolean existsByServiceIdAndAppointmentDateAndAppointmentTime(Long serviceId, LocalDate appointmentDate, LocalTime appointmentTime);
    long countByServiceBusinessIdAndAppointmentDateAndAppointmentTimeAndStatusNot(Long businessId, LocalDate appointmentDate, LocalTime appointmentTime, BookingStatus status);
    long countByStatus(BookingStatus status);
    List<Booking> findTop5ByOrderByCreatedAtDesc();
}
