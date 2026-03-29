package com.cbs.casa.entiity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "TB_ACCOUNT_STATUS_LOG")
public class AccountStatusLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "log_id")
    private Long logId;

    @Column(name = "account_id", nullable = false)
    private String accountId;

    @Column(name = "old_status")
    private String oldStatus;

    @Column(name = "new_status")
    private String newStatus;

    @Column(name = "changed_by")
    private String changedBy;

    @Column(name = "changed_at")
    private LocalDateTime changedAt;

    @Column(name = "remarks")
    private String remarks;

    @PrePersist
    public void prePersist() {
        changedAt = LocalDateTime.now();
    }
}