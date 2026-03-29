package com.cbs.customer.exception;

/**
 * Thrown when address details are not found for a given CIF.
 * <p>
 * Usage:
 * throw new AddressNotFoundException(cifId);
 */
public class AddressNotFoundException extends BankingException {

    public AddressNotFoundException(String cifId) {
        super("ADDRESS_NOT_FOUND", "Address not found for CIF ID: " + cifId);
    }
}