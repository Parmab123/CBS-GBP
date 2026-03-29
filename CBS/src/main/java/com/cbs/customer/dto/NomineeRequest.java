package com.cbs.customer.dto;

import lombok.Data;

@Data
public class NomineeRequest {
    private String nomineeName;
    private String dob;           // yyyy-MM-dd
    private String relation;
    private String phone;
    private String email;
    private String aadhaarNumber;
    private String panNumber;
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String state;
    private String postalCode;
    private String country;
    private String createdBy;
}