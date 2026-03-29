package com.cbs.customer.exception;

/**
 * Thrown when a CIF cannot be submitted for review.
 * e.g. onboarding not complete, or wrong status.
 * <p>
 * Usage:
 * throw new CifSubmissionException(cifId);
 */
public class CifSubmissionException extends BankingException {

    public CifSubmissionException(String cifId) {
        super("CIF_SUBMISSION_FAILED",
                "CIF [" + cifId + "] cannot be submitted. " +
                        "Ensure onboarding stage is FINAL_APPROVAL or status is REJECTED / CHANGES_REQUESTED.");
    }
}