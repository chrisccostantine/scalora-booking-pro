package com.scalora.bookingpro.service;

import com.scalora.bookingpro.dto.BookingDtos.BookingRequest;
import com.scalora.bookingpro.dto.BookingDtos.BookingResponse;
import com.scalora.bookingpro.entity.Booking;
import com.scalora.bookingpro.entity.BookingStatus;
import com.scalora.bookingpro.exception.ApiException;
import com.scalora.bookingpro.repository.BookingRepository;
import com.scalora.bookingpro.repository.ServiceRepository;
import jakarta.persistence.criteria.Predicate;
import java.time.LocalDate;
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

    public BookingService(BookingRepository bookings, ServiceRepository services) {
        this.bookings = bookings;
        this.services = services;
    }

    @Transactional
    public BookingResponse create(BookingRequest request) {
        var service = services.findById(request.serviceId())
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Service not found"));
        if (!service.isActive()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Service is not available for booking.");
        }
        boolean taken = bookings.existsByServiceIdAndAppointmentDateAndAppointmentTime(
            request.serviceId(),
            request.appointmentDate(),
            request.appointmentTime()
        );
        if (taken) {
            throw new ApiException(HttpStatus.CONFLICT, "This time slot is already booked.");
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
}
