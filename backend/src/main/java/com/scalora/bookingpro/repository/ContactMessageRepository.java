package com.scalora.bookingpro.repository;

import com.scalora.bookingpro.entity.ContactMessage;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContactMessageRepository extends JpaRepository<ContactMessage, Long> {
    void deleteByBusinessId(Long businessId);
}
