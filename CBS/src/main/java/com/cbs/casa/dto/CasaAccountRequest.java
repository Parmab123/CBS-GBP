package com.cbs.casa.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.Map;

@Data
public class CasaAccountRequest {
    private String cifId;
    private String accountType;
    private String branchCode;
    private String schemeCode;
    private BigDecimal initialDeposit;
    private String nomineeId;
    private Boolean isJoint;
    private String jointHolderName;
    private String jointHolderCif;
    private String jointHolderPan;
    private String createdBy;
    // Facilities map: { "chequeBook": true, "debitCard": false, ... }
    private Map<String, Boolean> facilities;
}