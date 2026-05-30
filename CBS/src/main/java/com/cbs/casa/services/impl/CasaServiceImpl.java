package com.cbs.casa.services.impl;

import com.cbs.casa.dto.CasaAccountRequest;
import com.cbs.casa.dto.CasaStatusRequest;
import com.cbs.casa.dto.DepositRequest;
import com.cbs.casa.entiity.AccountFacilities;
import com.cbs.casa.entiity.AccountStatusLog;
import com.cbs.casa.entiity.AccountTransaction;
import com.cbs.casa.entiity.CasaAccount;
import com.cbs.casa.repo.AccountFacilitiesRepository;
import com.cbs.casa.repo.AccountStatusLogRepository;
import com.cbs.casa.repo.AccountTransactionRepository;
import com.cbs.casa.repo.CasaAccountRepository;
import com.cbs.casa.services.CasaService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.ParameterMode;
import jakarta.persistence.StoredProcedureQuery;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class CasaServiceImpl implements CasaService {

    // Repositories — thread-safe, Spring-managed
    private final CasaAccountRepository casaAccountRepository;
    private final AccountStatusLogRepository statusLogRepository;
    private final AccountFacilitiesRepository facilitiesRepository;

    // EntityManager only for SP calls and master data queries
    private final EntityManager entityManager;
    private final AccountTransactionRepository transactionRepository;
    // ── Create CASA Account ───────────────────────────────────────────────────

    @Transactional
    public Map<String, String> createCasaAccount(CasaAccountRequest request) {

        // Call SP to generate account number and ID
        StoredProcedureQuery query =
                entityManager.createStoredProcedureQuery("sp_create_casa_account");

        query.registerStoredProcedureParameter("p_cif_id", String.class, ParameterMode.IN);
        query.registerStoredProcedureParameter("p_account_type", String.class, ParameterMode.IN);
        query.registerStoredProcedureParameter("p_branch_code", String.class, ParameterMode.IN);
        query.registerStoredProcedureParameter("p_scheme_code", String.class, ParameterMode.IN);
        query.registerStoredProcedureParameter("p_initial_deposit", BigDecimal.class, ParameterMode.IN);
        query.registerStoredProcedureParameter("p_nominee_id", String.class, ParameterMode.IN);
        query.registerStoredProcedureParameter("p_is_joint", Boolean.class, ParameterMode.IN);
        query.registerStoredProcedureParameter("p_joint_holder_name", String.class, ParameterMode.IN);
        query.registerStoredProcedureParameter("p_joint_holder_cif", String.class, ParameterMode.IN);
        query.registerStoredProcedureParameter("p_joint_holder_pan", String.class, ParameterMode.IN);
        query.registerStoredProcedureParameter("p_created_by", String.class, ParameterMode.IN);
        query.registerStoredProcedureParameter("p_account_id", String.class, ParameterMode.OUT);
        query.registerStoredProcedureParameter("p_account_number", String.class, ParameterMode.OUT);

        query.setParameter("p_cif_id", request.getCifId());
        query.setParameter("p_account_type", request.getAccountType());
        query.setParameter("p_branch_code", request.getBranchCode());
        query.setParameter("p_scheme_code", request.getSchemeCode());
        query.setParameter("p_initial_deposit", request.getInitialDeposit() != null
                ? request.getInitialDeposit() : BigDecimal.ZERO);
        query.setParameter("p_nominee_id", request.getNomineeId() != null ? request.getNomineeId() : "");
        query.setParameter("p_is_joint", request.getIsJoint() != null ? request.getIsJoint() : false);
        query.setParameter("p_joint_holder_name", request.getJointHolderName() != null ? request.getJointHolderName() : "");
        query.setParameter("p_joint_holder_cif", request.getJointHolderCif() != null ? request.getJointHolderCif() : "");
        query.setParameter("p_joint_holder_pan", request.getJointHolderPan() != null ? request.getJointHolderPan() : "");
        query.setParameter("p_created_by", request.getCreatedBy());

        query.execute();

        String accountId = (String) query.getOutputParameterValue("p_account_id");
        String accountNumber = (String) query.getOutputParameterValue("p_account_number");

        // Save facilities to TB_ACCOUNT_FACILITIES
        if (request.getFacilities() != null && !request.getFacilities().isEmpty()) {
            Map<String, String> facilityNames = new java.util.LinkedHashMap<>();
            facilityNames.put("chequeBook", "Cheque Book");
            facilityNames.put("debitCard", "Debit Card");
            facilityNames.put("internetBanking", "Internet Banking");
            facilityNames.put("mobileBanking", "Mobile Banking");
            facilityNames.put("smsAlerts", "SMS Alerts");
            facilityNames.put("emailAlerts", "Email Alerts");
            facilityNames.put("passbook", "Passbook");
            facilityNames.put("lockerFacility", "Locker Facility");

            final String finalAccountId = accountId;
            request.getFacilities().forEach((code, enabled) -> {
                AccountFacilities facility = new AccountFacilities();
                facility.setAccountId(finalAccountId);
                facility.setFacilityCode(code.toUpperCase());
                facility.setFacilityName(facilityNames.getOrDefault(code, code));
                facility.setIsEnabled(enabled != null ? enabled : false);
                facility.setCreatedBy(request.getCreatedBy());
                facilitiesRepository.save(facility);
            });
        }

        Map<String, String> result = new LinkedHashMap<>();
        result.put("accountId", accountId);
        result.put("accountNumber", accountNumber);
        return result;
    }

    // ── Get Accounts by CIF — uses Repository ─────────────────────────────────

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAccountsByCif(String cifId) {
        List<CasaAccount> accounts = casaAccountRepository
                .findByCifIdOrderByCreatedDateDesc(cifId);

        List<Map<String, Object>> result = new ArrayList<>();
        for (CasaAccount a : accounts) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("account_id", a.getAccountId());
            map.put("account_number", a.getAccountNumber());
            map.put("account_type", a.getAccountType());
            map.put("account_status", a.getAccountStatus());
            map.put("branch_code", a.getBranchCode());
            map.put("branch_name", a.getBranchName());
            map.put("scheme_name", a.getSchemeName());
            map.put("interest_rate", a.getInterestRate());
            map.put("initial_deposit", a.getInitialDeposit());
            map.put("current_balance", a.getCurrentBalance());
            map.put("is_joint", a.getIsJoint());
            map.put("joint_holder_name", a.getJointHolderName());
            map.put("created_by", a.getCreatedBy());
            map.put("created_date", a.getCreatedDate());
            map.put("approved_by", a.getApprovedBy());
            map.put("approved_date", a.getApprovedDate());
            map.put("remarks", a.getRemarks());
            // Load facilities
            List<AccountFacilities> facs = facilitiesRepository.findByAccountId(a.getAccountId());
            Map<String, Object> facilityMap = new LinkedHashMap<>();
            facs.forEach(f -> facilityMap.put(f.getFacilityCode(), f.getIsEnabled()));
            map.put("facilities", facilityMap);
            result.add(map);
        }
        return result;
    }

    // ── Get Pending CASA Approvals — uses Repository ───────────────────────────

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getPendingCasaApprovals() {
        List<Object[]> rows = casaAccountRepository.findPendingApprovalsWithCustomer();

        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] r : rows) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("account_id", r[0]);
            map.put("account_number", r[1]);
            map.put("account_type", r[2]);
            map.put("account_status", r[3]);
            map.put("branch_name", r[4]);
            map.put("scheme_name", r[5]);
            map.put("interest_rate", r[6]);
            map.put("initial_deposit", r[7]);
            map.put("is_joint", r[8]);
            map.put("created_by", r[9]);
            map.put("created_date", r[10]);
            map.put("first_name", r[11]);
            map.put("last_name", r[12]);
            map.put("mobile_no", r[13]);
            map.put("pan_no", r[14]);
            map.put("cif_id", r[15]);
            result.add(map);
        }
        return result;
    }

    // ── Approve / Reject CASA — uses Repository ────────────────────────────────

    @Transactional
    public void updateCasaStatus(String accountId, CasaStatusRequest request) {
        CasaAccount account = casaAccountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found: " + accountId));

        String oldStatus = account.getAccountStatus();
        String newStatus = request.getNewStatus();

        account.setAccountStatus(newStatus);
        account.setApprovedBy(request.getChangedBy());
        account.setRemarks(request.getRemarks());

        // If approved → set balance to initial deposit
        if ("ACTIVE".equals(newStatus)) {
            account.setCurrentBalance(account.getInitialDeposit());
        }

        casaAccountRepository.save(account);

        // Log status change using Repository
        AccountStatusLog log = new AccountStatusLog();
        log.setAccountId(accountId);
        log.setOldStatus(oldStatus);
        log.setNewStatus(newStatus);
        log.setChangedBy(request.getChangedBy());
        log.setRemarks(request.getRemarks());
        statusLogRepository.save(log);
    }

    // ── Get Branches — EntityManager for master data ───────────────────────────

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getBranches() {
        List<Object[]> rows = entityManager.createNativeQuery("""
                SELECT branch_id, branch_name, city, ifsc_code
                FROM TB_BRANCH_MASTER
                WHERE status = 'ACTIVE'
                ORDER BY branch_name
                """).getResultList();

        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] r : rows) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("branch_id", r[0]);
            map.put("branch_name", r[1]);
            map.put("city", r[2]);
            map.put("ifsc_code", r[3]);
            result.add(map);
        }
        return result;
    }

    // ── Get Schemes — EntityManager for master data ────────────────────────────

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getSchemes(String accountType) {
        List<Object[]> rows = entityManager.createNativeQuery("""
                        SELECT scheme_code, scheme_name, interest_rate, min_balance, description
                        FROM TB_ACCOUNT_SCHEME_MASTER
                        WHERE is_active = true
                        AND (:accountType IS NULL OR account_type = :accountType)
                        ORDER BY scheme_name
                        """)
                .setParameter("accountType", accountType)
                .getResultList();

        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] r : rows) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("scheme_code", r[0]);
            map.put("scheme_name", r[1]);
            map.put("interest_rate", r[2]);
            map.put("min_balance", r[3]);
            map.put("description", r[4]);
            result.add(map);
        }
        return result;
    }

    @Override
    @Transactional
    public void deposit(
            DepositRequest request,
            String username
    ) {


        CasaAccount account =
                casaAccountRepository
                        .findByAccountNumber(
                                request.getAccountNumber()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Account not found"
                                )
                        );

        if (!"ACTIVE".equals(
                account.getAccountStatus()
        )) {

            throw new RuntimeException(
                    "Account is not active"
            );
        }

        BigDecimal newBalance =
                account.getCurrentBalance()
                        .add(request.getAmount());

        account.setCurrentBalance(newBalance);

        casaAccountRepository.save(account);

        AccountTransaction transaction =
                new AccountTransaction();

        transaction.setTransactionId(
                UUID.randomUUID().toString()
        );

        transaction.setAccountNumber(
                account.getAccountNumber()
        );

        transaction.setTransactionType("DEPOSIT");

        transaction.setAmount(
                request.getAmount()
        );

        transaction.setBalanceAfter(
                newBalance
        );

        transaction.setRemarks(
                request.getRemarks()
        );

        transaction.setCreatedBy(
                username
        );

        transaction.setCreatedDate(
                LocalDateTime.now()
        );

        transactionRepository.save(transaction);
    }
}