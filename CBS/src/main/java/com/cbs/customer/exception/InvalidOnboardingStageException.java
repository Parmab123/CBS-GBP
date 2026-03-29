package com.cbs.customer.exception;


public class InvalidOnboardingStageException extends BankingException {

    public InvalidOnboardingStageException(String cifId, String currentStage, String requiredStage) {
        super("INVALID_ONBOARDING_STAGE",
                "CIF [" + cifId + "] is at stage [" + currentStage + "]. " +
                        "Expected stage: [" + requiredStage + "]");
    }

    public InvalidOnboardingStageException(String message) {
        super("INVALID_ONBOARDING_STAGE", message);
    }
}