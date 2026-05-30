package com.cbs.casa.entiity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "TB_ACCOUNT_TRANSACTION")
@Getter
@Setter
public class AccountTransaction {

    @Id
    @Column(name = "TRANSACTION_ID")
    private String transactionId;

    @Column(name = "ACCOUNT_NUMBER")
    private String accountNumber;

    @Column(name = "TRANSACTION_TYPE")
    private String transactionType;

    @Column(name = "AMOUNT")
    private BigDecimal amount;

    @Column(name = "BALANCE_AFTER")
    private BigDecimal balanceAfter;

    @Column(name = "REMARKS")
    private String remarks;

    @Column(name = "CREATED_BY")
    private String createdBy;

    @Column(name = "CREATED_DATE")
    private LocalDateTime createdDate;
}