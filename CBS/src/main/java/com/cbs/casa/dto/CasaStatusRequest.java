package com.cbs.casa.dto;

import lombok.Data;

@Data
public class CasaStatusRequest {
    private String newStatus;
    private String changedBy;
    private String remarks;
}