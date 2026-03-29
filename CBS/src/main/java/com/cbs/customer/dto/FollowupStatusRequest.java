package com.cbs.customer.dto;

import lombok.Data;

@Data
public class FollowupStatusRequest {
    private String status;
    private String remarks;
    private String updatedBy;
}