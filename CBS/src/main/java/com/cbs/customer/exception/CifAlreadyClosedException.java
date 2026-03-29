package com.cbs.customer.exception;

/**
 * Thrown when an operation is attempted on a CIF that has already been closed.
 * <p>
 * Usage:
 * throw new CifAlreadyClosedException(cifId);
 */
public class CifAlreadyClosedException extends BankingException {

    public CifAlreadyClosedException(String cifId) {
        super("CIF_ALREADY_CLOSED", "CIF [" + cifId + "] is already closed and cannot be modified.");
    }
}