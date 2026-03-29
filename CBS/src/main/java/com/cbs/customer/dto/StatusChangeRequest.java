package com.cbs.customer.dto;

import lombok.Data;

@Data
public class StatusChangeRequest {

    private String newStatus;
    private String changedBy;
    private String remarks;
}