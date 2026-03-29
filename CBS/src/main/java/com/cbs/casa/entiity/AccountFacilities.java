package com.cbs.casa.entiity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "TB_ACCOUNT_FACILITIES")
public class AccountFacilities {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "facility_id")
    private Long facilityId;

    @Column(name = "account_id", nullable = false)
    private String accountId;

    @Column(name = "facility_code", nullable = false)
    private String facilityCode;

    @Column(name = "facility_name", nullable = false)
    private String facilityName;

    @Column(name = "is_enabled")
    private Boolean isEnabled;

    @Column(name = "created_date")
    private LocalDateTime createdDate;

    @Column(name = "created_by")
    private String createdBy;

    @PrePersist
    public void prePersist() {
        createdDate = LocalDateTime.now();
        if (isEnabled == null) isEnabled = false;
    }
}