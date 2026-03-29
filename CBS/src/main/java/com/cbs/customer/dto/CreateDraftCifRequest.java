package com.cbs.customer.dto;

import lombok.Data;

@Data
public class CreateDraftCifRequest {
    private String customertype;
    private String customerSubType;
    private String firstName;
    private String lastName;
    private String dob;
    private String panNo;
    private String mobileNo;
    private String email;
    private String createdBy;
    private String branchId;
    private String middlename;
    private String salutation;
}