package com.scalora.bookingpro.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "business_info")
public class BusinessInfo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @OneToOne
    @JoinColumn(name = "business_id", unique = true)
    private Business business;
    private String businessName;
    @Lob
    @Column(columnDefinition = "TEXT")
    private String logoUrl;
    @Lob
    @Column(columnDefinition = "TEXT")
    private String coverImageUrl;
    @Lob
    @Column(columnDefinition = "TEXT")
    private String galleryImageUrls;
    private String phoneNumber;
    private String whatsappNumber;
    private String address;
    @Column(length = 1200)
    private String openingHours;
    private String facebookUrl;
    private String instagramUrl;
    private String linkedinUrl;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Business getBusiness() { return business; }
    public void setBusiness(Business business) { this.business = business; }
    public String getBusinessName() { return businessName; }
    public void setBusinessName(String businessName) { this.businessName = businessName; }
    public String getLogoUrl() { return logoUrl; }
    public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }
    public String getCoverImageUrl() { return coverImageUrl; }
    public void setCoverImageUrl(String coverImageUrl) { this.coverImageUrl = coverImageUrl; }
    public String getGalleryImageUrls() { return galleryImageUrls; }
    public void setGalleryImageUrls(String galleryImageUrls) { this.galleryImageUrls = galleryImageUrls; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public String getWhatsappNumber() { return whatsappNumber; }
    public void setWhatsappNumber(String whatsappNumber) { this.whatsappNumber = whatsappNumber; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getOpeningHours() { return openingHours; }
    public void setOpeningHours(String openingHours) { this.openingHours = openingHours; }
    public String getFacebookUrl() { return facebookUrl; }
    public void setFacebookUrl(String facebookUrl) { this.facebookUrl = facebookUrl; }
    public String getInstagramUrl() { return instagramUrl; }
    public void setInstagramUrl(String instagramUrl) { this.instagramUrl = instagramUrl; }
    public String getLinkedinUrl() { return linkedinUrl; }
    public void setLinkedinUrl(String linkedinUrl) { this.linkedinUrl = linkedinUrl; }
}
