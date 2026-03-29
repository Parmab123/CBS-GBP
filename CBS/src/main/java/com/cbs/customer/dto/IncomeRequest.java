package com.cbs.customer.dto;

import lombok.Data;

@Data
public class IncomeRequest {
    private String incomeSource;
    private Double annualIncome;
    private String employerName;
    private String employerAddress;
    private String employerCity;
    private String employerState;
    private String employerPincode;
    private Boolean itrFiled;
    private String itrYear;
    private Double itrAmount;
    private String bankAccountNumber;
    private String bankName;
    private String bankIfsc;
    private String bankBranch;
    private String createdBy;
}