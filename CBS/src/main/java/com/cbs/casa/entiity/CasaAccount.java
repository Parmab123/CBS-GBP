package com.cbs.casa.entiity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "TB_CASA_ACCOUNT")
public class CasaAccount {

    @Id
    @Column(name = "account_id")
    private String accountId;

    @Column(name = "account_number", unique = true, nullable = false)
    private String accountNumber;

    @Column(name = "cif_id", nullable = false)
    private String cifId;

    @Column(name = "account_type", nullable = false)
    private String accountType;

    @Column(name = "account_status")
    private String accountStatus;

    @Column(name = "branch_code")
    private String branchCode;

    @Column(name = "branch_name")
    private String branchName;

    @Column(name = "scheme_code")
    private String schemeCode;

    @Column(name = "scheme_name")
    private String schemeName;

    @Column(name = "interest_rate")
    private BigDecimal interestRate;

    @Column(name = "initial_deposit")
    private BigDecimal initialDeposit;

    @Column(name = "current_balance")
    private BigDecimal currentBalance;

    @Column(name = "nominee_id")
    private String nomineeId;

    @Column(name = "is_joint")
    private Boolean isJoint;

    @Column(name = "joint_holder_name")
    private String jointHolderName;

    @Column(name = "joint_holder_cif")
    private String jointHolderCif;

    @Column(name = "joint_holder_pan")
    private String jointHolderPan;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "created_date")
    private LocalDateTime createdDate;

    @Column(name = "approved_by")
    private String approvedBy;

    @Column(name = "approved_date")
    private LocalDateTime approvedDate;

    @Column(name = "remarks")
    private String remarks;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        createdDate = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (accountStatus == null) accountStatus = "PENDING_APPROVAL";
        if (isJoint == null) isJoint = false;
        if (initialDeposit == null) initialDeposit = BigDecimal.ZERO;
        if (currentBalance == null) currentBalance = BigDecimal.ZERO;
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}