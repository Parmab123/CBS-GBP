package com.cbs.customer.dto;

import lombok.Data;

@Data
public class ModificationReviewRequest {
    private String action;    // APPROVE or REJECT
    private String reviewedBy;
    private String remarks;
}