package com.cbs.customer.exception;

/**
 * Thrown when a CIF / customer record cannot be found in TB_CIF_MASTER.
 * <p>
 * Usage:
 * throw new CustomerNotFoundException(cifId);
 */
public class CustomerNotFoundException extends BankingException {

    public CustomerNotFoundException(String cifId) {
        super("CUSTOMER_NOT_FOUND", "Customer not found for CIF ID: " + cifId);
    }
}