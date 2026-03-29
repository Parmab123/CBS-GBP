package com.cbs.customer.dto;

import lombok.Data;

@Data
public class ModificationRequest {
    private String requestId;
    private String cifId;
    private String section;
    private String oldData;
    private String newData;
    private String status;
    private String requestedBy;
    private String requestedAt;
    private String reviewedBy;
    private String reviewRemarks;
}