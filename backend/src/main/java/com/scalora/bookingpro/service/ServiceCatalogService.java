package com.scalora.bookingpro.service;

import com.scalora.bookingpro.dto.ServiceDtos.ServiceRequest;
import com.scalora.bookingpro.dto.ServiceDtos.ServiceResponse;
import com.scalora.bookingpro.entity.Business;
import com.scalora.bookingpro.entity.ServiceEntity;
import com.scalora.bookingpro.exception.ApiException;
import com.scalora.bookingpro.repository.BusinessRepository;
import com.scalora.bookingpro.repository.ServiceRepository;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class ServiceCatalogService {
    private final ServiceRepository services;
    private final BusinessRepository businesses;

    public ServiceCatalogService(ServiceRepository services, BusinessRepository businesses) {
        this.services = services;
        this.businesses = businesses;
    }

    public List<ServiceResponse> publicServices() {
        return services.findByActiveTrueOrderByNameAsc().stream().map(this::toResponse).toList();
    }

    public List<ServiceResponse> publicServices(String slug) {
        return services.findByBusinessSlugAndActiveTrueOrderByNameAsc(slug).stream().map(this::toResponse).toList();
    }

    public List<ServiceResponse> all(Long businessId) {
        if (businessId == null) {
            return services.findAll().stream().map(this::toResponse).toList();
        }
        return services.findByBusinessIdOrderByNameAsc(businessId).stream().map(this::toResponse).toList();
    }

    public ServiceResponse create(Long businessId, ServiceRequest request) {
        ServiceEntity service = new ServiceEntity();
        service.setBusiness(findBusiness(businessId));
        apply(service, request);
        return toResponse(services.save(service));
    }

    public ServiceResponse update(Long id, ServiceRequest request) {
        ServiceEntity service = services.findById(id)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Service not found"));
        apply(service, request);
        return toResponse(services.save(service));
    }

    public void delete(Long id) {
        if (!services.existsById(id)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Service not found");
        }
        services.deleteById(id);
    }

    private void apply(ServiceEntity service, ServiceRequest request) {
        service.setName(request.name());
        service.setDescription(request.description());
        service.setDurationMinutes(request.durationMinutes());
        service.setPrice(request.price());
        service.setActive(request.active());
    }

    public ServiceResponse toResponse(ServiceEntity service) {
        return new ServiceResponse(service.getId(), service.getBusiness().getId(), service.getName(), service.getDescription(), service.getDurationMinutes(), service.getPrice(), service.isActive());
    }

    private Business findBusiness(Long businessId) {
        return businesses.findById(businessId).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Business not found"));
    }
}
