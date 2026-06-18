package com.scalora.bookingpro.service;

import com.scalora.bookingpro.dto.ContactDtos.ContactRequest;
import com.scalora.bookingpro.dto.ContactDtos.ContactResponse;
import com.scalora.bookingpro.entity.ContactMessage;
import com.scalora.bookingpro.exception.ApiException;
import com.scalora.bookingpro.repository.BusinessRepository;
import com.scalora.bookingpro.repository.ContactMessageRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class ContactService {
    private final ContactMessageRepository messages;
    private final BusinessRepository businesses;

    public ContactService(ContactMessageRepository messages, BusinessRepository businesses) {
        this.messages = messages;
        this.businesses = businesses;
    }

    public ContactResponse create(String slug, ContactRequest request) {
        ContactMessage message = new ContactMessage();
        message.setBusiness(businesses.findBySlug(slug).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Business not found")));
        message.setName(request.name());
        message.setEmail(request.email());
        message.setPhoneNumber(request.phoneNumber());
        message.setMessage(request.message());
        ContactMessage saved = messages.save(message);
        return new ContactResponse(saved.getId(), saved.getName(), saved.getEmail(), saved.getPhoneNumber(), saved.getMessage(), saved.getCreatedAt());
    }
}
