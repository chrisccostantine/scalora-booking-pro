package com.scalora.bookingpro.service;

import com.scalora.bookingpro.entity.Booking;
import com.scalora.bookingpro.entity.Business;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class WhatsAppNotificationService {
    private static final Logger log = LoggerFactory.getLogger(WhatsAppNotificationService.class);

    private final RestClient restClient;
    private final boolean enabled;
    private final String accessToken;
    private final String phoneNumberId;
    private final String graphVersion;

    public WhatsAppNotificationService(
        RestClient.Builder restClientBuilder,
        @Value("${app.whatsapp.enabled:false}") boolean enabled,
        @Value("${app.whatsapp.access-token:}") String accessToken,
        @Value("${app.whatsapp.phone-number-id:}") String phoneNumberId,
        @Value("${app.whatsapp.graph-version:v20.0}") String graphVersion
    ) {
        this.restClient = restClientBuilder.build();
        this.enabled = enabled;
        this.accessToken = accessToken;
        this.phoneNumberId = phoneNumberId;
        this.graphVersion = graphVersion;
    }

    public void bookingCreated(Booking booking) {
        Business business = booking.getService().getBusiness();
        String recipient = normalizePhone(firstNonBlank(business.getWhatsappNumber(), business.getPhone()));
        if (!enabled || accessToken.isBlank() || phoneNumberId.isBlank()) {
            log.info("WhatsApp booking notification skipped because WhatsApp is not configured.");
            return;
        }
        if (recipient.isBlank()) {
            log.info("WhatsApp booking notification skipped because business {} has no WhatsApp number.", business.getId());
            return;
        }

        try {
            restClient.post()
                .uri("https://graph.facebook.com/{version}/{phoneNumberId}/messages", graphVersion, phoneNumberId)
                .header("Authorization", "Bearer " + accessToken)
                .body(Map.of(
                    "messaging_product", "whatsapp",
                    "to", recipient,
                    "type", "text",
                    "text", Map.of("body", message(booking))
                ))
                .retrieve()
                .toBodilessEntity();
        } catch (RuntimeException exception) {
            log.warn("WhatsApp booking notification failed for booking {}: {}", booking.getId(), exception.getMessage());
        }
    }

    private String message(Booking booking) {
        Business business = booking.getService().getBusiness();
        return """
            New booking request for %s

            Service: %s
            Date: %s
            Time: %s
            Customer: %s
            Phone: %s
            Email: %s
            Notes: %s
            Status: %s
            """.formatted(
                business.getName(),
                booking.getService().getName(),
                booking.getAppointmentDate(),
                booking.getAppointmentTime(),
                booking.getCustomerName(),
                booking.getPhoneNumber(),
                booking.getEmail(),
                firstNonBlank(booking.getNotes(), "-"),
                booking.getStatus().name()
            ).trim();
    }

    private String firstNonBlank(String first, String second) {
        return first != null && !first.isBlank() ? first : second == null ? "" : second;
    }

    private String normalizePhone(String phone) {
        if (phone == null) return "";
        return phone.replaceAll("[^0-9]", "");
    }
}
