package com.cbs.customer.dto;

import lombok.Data;

@Data
public class SignatureRequest {
    private String signatureData;  // base64 image
    private String signatureType;  // DRAWN or UPLOADED
}