package com.scalora.bookingpro.service;

import com.scalora.bookingpro.dto.BookingDtos.AvailabilitySlotResponse;
import com.scalora.bookingpro.dto.BookingDtos.BookingRequest;
import com.scalora.bookingpro.dto.BookingDtos.BookingResponse;
import com.scalora.bookingpro.entity.Booking;
import com.scalora.bookingpro.entity.BookingStatus;
import com.scalora.bookingpro.entity.BusinessAvailability;
import com.scalora.bookingpro.entity.Role;
import com.scalora.bookingpro.entity.User;
import com.scalora.bookingpro.exception.ApiException;
import com.scalora.bookingpro.repository.BusinessAvailabilityRepository;
import com.scalora.bookingpro.repository.BookingRepository;
import com.scalora.bookingpro.repository.ServiceRepository;
import jakarta.persistence.criteria.Predicate;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BookingService {
    private final BookingRepository bookings;
    private final ServiceRepository services;
    private final BusinessAvailabilityRepository availability;

    public BookingService(BookingRepository bookings, ServiceRepository services, BusinessAvailabilityRepository availability) {
        this.bookings = bookings;
        this.services = services;
        this.availability = availability;
    }

    @Transactional
    public BookingResponse create(BookingRequest request) {
        var service = services.findById(request.serviceId())
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Service not found"));
        if (!service.isActive()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Service is not available for booking.");
        }
        BusinessAvailability window = matchingAvailability(service.getBusiness().getId(), request.appointmentDate(), request.appointmentTime(), service.getDurationMinutes());
        long booked = bookings.countByServiceBusinessIdAndAppointmentDateAndAppointmentTimeAndStatusNot(
            service.getBusiness().getId(),
            request.appointmentDate(),
            request.appointmentTime(),
            BookingStatus.CANCELLED
        );
        if (booked >= window.getCapacity()) {
            throw new ApiException(HttpStatus.CONFLICT, "This time slot is fully booked.");
        }

        Booking booking = new Booking();
        booking.setService(service);
        booking.setAppointmentDate(request.appointmentDate());
        booking.setAppointmentTime(request.appointmentTime());
        booking.setCustomerName(request.customerName());
        booking.setPhoneNumber(request.phoneNumber());
        booking.setEmail(request.email());
        booking.setNotes(request.notes());
        booking.setStatus(BookingStatus.PENDING);
        return toResponse(bookings.save(booking));
    }

    public List<AvailabilitySlotResponse> availableSlots(Long serviceId, LocalDate date) {
        var service = services.findById(serviceId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Service not found"));
        List<AvailabilitySlotResponse> slots = new ArrayList<>();
        List<BusinessAvailability> windows = availability.findByBusinessIdAndDayOfWeekAndActiveTrueOrderByStartTimeAsc(
            service.getBusiness().getId(),
            date.getDayOfWeek()
        );
        for (BusinessAvailability window : windows) {
            LocalTime time = window.getStartTime();
            while (!time.plusMinutes(service.getDurationMinutes()).isAfter(window.getEndTime())) {
                long booked = bookings.countByServiceBusinessIdAndAppointmentDateAndAppointmentTimeAndStatusNot(
                    service.getBusiness().getId(),
                    date,
                    time,
                    BookingStatus.CANCELLED
                );
                long remaining = Math.max(0, window.getCapacity() - booked);
                if (remaining > 0) {
                    slots.add(new AvailabilitySlotResponse(time, window.getCapacity(), booked, remaining));
                }
                time = time.plusMinutes(service.getDurationMinutes());
            }
        }
        return slots;
    }

    public List<BookingResponse> findAdmin(Long businessId, BookingStatus status, LocalDate date, Long serviceId) {
        Specification<Booking> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (businessId != null) predicates.add(cb.equal(root.get("service").get("business").get("id"), businessId));
            if (status != null) predicates.add(cb.equal(root.get("status"), status));
            if (date != null) predicates.add(cb.equal(root.get("appointmentDate"), date));
            if (serviceId != null) predicates.add(cb.equal(root.get("service").get("id"), serviceId));
            query.orderBy(cb.desc(root.get("createdAt")));
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        return bookings.findAll(spec).stream().map(this::toResponse).toList();
    }

    public BookingResponse updateStatus(Long id, BookingStatus status) {
        Booking booking = bookings.findById(id)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Booking not found"));
        booking.setStatus(status);
        return toResponse(bookings.save(booking));
    }

    public BookingResponse updateStatus(Long id, BookingStatus status, User user) {
        Booking booking = bookings.findById(id)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Booking not found"));
        Long businessId = booking.getService().getBusiness().getId();
        boolean superAdmin = user.getRole() == Role.SUPER_ADMIN || user.getRole() == Role.ADMIN;
        if (!superAdmin && (user.getBusiness() == null || !businessId.equals(user.getBusiness().getId()))) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You can only manage your assigned business.");
        }
        booking.setStatus(status);
        return toResponse(bookings.save(booking));
    }

    public BookingResponse toResponse(Booking booking) {
        return new BookingResponse(
            booking.getId(),
            booking.getService().getId(),
            booking.getService().getBusiness().getId(),
            booking.getService().getName(),
            booking.getAppointmentDate(),
            booking.getAppointmentTime(),
            booking.getCustomerName(),
            booking.getPhoneNumber(),
            booking.getEmail(),
            booking.getNotes(),
            booking.getStatus(),
            booking.getCreatedAt()
        );
    }

    private BusinessAvailability matchingAvailability(Long businessId, LocalDate date, LocalTime time, Integer durationMinutes) {
        return availability.findByBusinessIdAndDayOfWeekAndActiveTrueOrderByStartTimeAsc(businessId, date.getDayOfWeek()).stream()
            .filter(window -> !time.isBefore(window.getStartTime()))
            .filter(window -> !time.plusMinutes(durationMinutes).isAfter(window.getEndTime()))
            .findFirst()
            .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Selected time is outside business availability."));
    }
}
