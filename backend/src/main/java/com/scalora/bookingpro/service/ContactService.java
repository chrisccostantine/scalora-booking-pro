package com.scalora.bookingpro.service;

import com.scalora.bookingpro.dto.ContactDtos.ContactRequest;
import com.scalora.bookingpro.dto.ContactDtos.ContactResponse;
import com.scalora.bookingpro.entity.ContactMessage;
import com.scalora.bookingpro.repository.ContactMessageRepository;
import org.springframework.stereotype.Service;

@Service
public class ContactService {
    private final ContactMessageRepository messages;

    public ContactService(ContactMessageRepository messages) {
        this.messages = messages;
    }

    public ContactResponse create(ContactRequest request) {
        ContactMessage message = new ContactMessage();
        message.setName(request.name());
        message.setEmail(request.email());
        message.setPhoneNumber(request.phoneNumber());
        message.setMessage(request.message());
        ContactMessage saved = messages.save(message);
        return new ContactResponse(saved.getId(), saved.getName(), saved.getEmail(), saved.getPhoneNumber(), saved.getMessage(), saved.getCreatedAt());
    }
}
