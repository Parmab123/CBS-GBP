package com.cbs.casa.services;

import com.cbs.casa.dto.CasaAccountRequest;
import com.cbs.casa.dto.CasaStatusRequest;
import com.cbs.casa.dto.DepositRequest;

import java.util.List;
import java.util.Map;

public interface CasaService {
    Map<String, String> createCasaAccount(CasaAccountRequest request);

    List<Map<String, Object>> getAccountsByCif(String cifId);

    List<Map<String, Object>> getPendingCasaApprovals();

    void updateCasaStatus(String accountId, CasaStatusRequest request);

    List<Map<String, Object>> getBranches();

    List<Map<String, Object>> getSchemes(String accountType);

    void deposit(
            DepositRequest request,
            String username
    );

}
