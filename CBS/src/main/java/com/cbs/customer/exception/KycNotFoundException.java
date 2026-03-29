package com.cbs.customer.exception;

/**
 * Thrown when KYC details are not found for a given CIF.
 * <p>
 * Usage:
 * throw new KycNotFoundException(cifId);
 */
public class KycNotFoundException extends BankingException {

    public KycNotFoundException(String cifId) {
        super("KYC_NOT_FOUND", "KYC details not found for CIF ID: " + cifId);
    }
}