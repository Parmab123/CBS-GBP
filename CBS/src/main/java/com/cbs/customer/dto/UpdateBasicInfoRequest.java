package com.cbs.customer.dto;

import lombok.Data;

@Data
public class UpdateBasicInfoRequest {

    private String firstName;
    private String lastName;
    private String mobileNo;
    private String email;
}