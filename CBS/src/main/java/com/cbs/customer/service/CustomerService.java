package com.cbs.customer.service;

import com.cbs.customer.dto.*;

import java.util.List;
import java.util.Map;

public interface CustomerService {

    void changeCifStatus(String cifId, StatusChangeRequest request);

    String createDraftCif(CreateDraftCifRequest request);

    void updateBasicInfo(String cifId, UpdateBasicInfoRequest request);

    void updateAddress(String cifId, AddressRequest request);

    void addAddress(String cifId, AddressRequest request);

    void addKyc(String cifId, KycRequest request);

    void addRisk(String cifId, RiskRequest request);

    void submitForReview(String cifId);

    List<Map<String, Object>> getAllCustomers();

    List<Map<String, Object>> getPendingApprovals();

    Map<String, Object> getCustomerDetails(String cifId);

    Map<String, Object> getDashboardStats();

    List<Map<String, Object>> getRecentCustomers();          // ← was missing

    void modifyBasicInfo(String cifId, UpdateBasicInfoRequest request);

    void modifyAddress(String cifId, AddressRequest request);

    void modifyKyc(String cifId, KycRequest request);

    void modifyRisk(String cifId, RiskRequest request);

    void closeCif(String cifId, String remarks);

    String autoDetectFollowupStatus(String cifId);

    void updateFollowupStatus(String cifId, FollowupStatusRequest request);

    List<Map<String, Object>> getFollowupStatusMaster();     // ← was missing

    void saveSignature(String cifId, SignatureRequest request);

    String submitModificationRequest(String cifId, String section,
                                     String oldData, String newData, String requestedBy);

    List<Map<String, Object>> getPendingModifications();     // ← was missing

    List<Map<String, Object>> getModificationsByCif(String cifId);

    void reviewModification(String requestId, ModificationReviewRequest request) throws Exception;

    void applyModification(String cifId, String section, String newDataJson) throws Exception;

    void addIncome(String cifId, IncomeRequest request);

    void addNominee(String cifId, NomineeRequest request);
}