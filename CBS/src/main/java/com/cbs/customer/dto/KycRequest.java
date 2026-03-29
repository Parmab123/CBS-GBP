package com.cbs.customer.dto;

import lombok.Data;

@Data
public class KycRequest {

    private String panNumber;
    private String aadhaarNumber;
    private String kycType;
}