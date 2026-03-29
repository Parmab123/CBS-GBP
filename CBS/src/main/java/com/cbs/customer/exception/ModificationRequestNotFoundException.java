package com.cbs.customer.exception;

/**
 * Thrown when a modification request is not found or already reviewed.
 * <p>
 * Usage:
 * throw new ModificationRequestNotFoundException(requestId);
 */
public class ModificationRequestNotFoundException extends BankingException {

    public ModificationRequestNotFoundException(String requestId) {
        super("MODIFICATION_REQUEST_NOT_FOUND",
                "Modification request [" + requestId + "] not found or already reviewed.");
    }
}