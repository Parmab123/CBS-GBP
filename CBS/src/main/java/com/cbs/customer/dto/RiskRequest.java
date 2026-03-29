package com.cbs.customer.dto;

import lombok.Data;

@Data
public class RiskRequest {

    private String incomeRange;
    private String occupation;
    private Boolean politicallyExposedPerson;
    private String riskCategory;
}