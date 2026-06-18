package com.scalora.bookingpro.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "testimonials")
public class Testimonial {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "business_id")
    private Business business;
    @Column(nullable = false)
    private String customerName;
    @Column(nullable = false, length = 1200)
    private String content;
    @Column(nullable = false)
    private Integer rating = 5;
    @Column(nullable = false)
    private boolean active = true;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Business getBusiness() { return business; }
    public void setBusiness(Business business) { this.business = business; }
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
