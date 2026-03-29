package com.cbs.customer.exception;

/**
 * Thrown when signature data is invalid or missing.
 * <p>
 * Usage:
 * throw new InvalidSignatureException(cifId);
 */
public class InvalidSignatureException extends BankingException {

    public InvalidSignatureException(String cifId) {
        super("INVALID_SIGNATURE", "Invalid or missing signature for CIF ID: " + cifId);
    }

    public InvalidSignatureException(String cifId, String reason) {
        super("INVALID_SIGNATURE", "Signature error for CIF [" + cifId + "]: " + reason);
    }
}