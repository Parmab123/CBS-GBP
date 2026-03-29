package com.cbs.customer.exception;

/**
 * Thrown when a risk profile is not found for a given CIF.
 * <p>
 * Usage:
 * throw new RiskProfileNotFoundException(cifId);
 */
public class RiskProfileNotFoundException extends BankingException {

    public RiskProfileNotFoundException(String cifId) {
        super("RISK_PROFILE_NOT_FOUND", "Risk profile not found for CIF ID: " + cifId);
    }
}