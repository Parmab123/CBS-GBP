package com.cbs.customer.exception;

/**
 * Thrown when a customer with the same PAN / Aadhaar / mobile already exists.
 * <p>
 * Usage:
 * throw new DuplicateCustomerException("PAN", "ABCDE1234F");
 */
public class DuplicateCustomerException extends BankingException {

    public DuplicateCustomerException(String field, String value) {
        super("DUPLICATE_CUSTOMER",
                "A customer with " + field + " [" + value + "] already exists.");
    }
}