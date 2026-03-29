package com.cbs.customer.exception;

/**
 * Thrown when an operation is attempted on a CIF that is in the wrong status.
 * <p>
 * Usage:
 * throw new InvalidCifStatusException(cifId, "DRAFT", "UNDER_REVIEW");
 */
public class InvalidCifStatusException extends BankingException {

    public InvalidCifStatusException(String cifId, String currentStatus, String requiredStatus) {
        super("INVALID_CIF_STATUS",
                "CIF [" + cifId + "] is in status [" + currentStatus + "]. " +
                        "Required status: [" + requiredStatus + "]");
    }

    public InvalidCifStatusException(String message) {
        super("INVALID_CIF_STATUS", message);
    }
}