package com.cbs.customer.dto;

import lombok.Data;

@Data
public class AddressRequest {

    private String addressType;
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String state;
    private String postalCode;
    private String country;
}