package com.cbs.customer.service.Impl;

import com.cbs.customer.dto.*;
import com.cbs.customer.exception.*;
import com.cbs.customer.service.CustomerService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import jakarta.persistence.ParameterMode;
import jakarta.persistence.StoredProcedureQuery;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Date;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {

    private final EntityManager entityManager;

    // ── Change CIF Status ──────────────────────────────────────────────────────

    @Transactional
    public void changeCifStatus(String cifId, StatusChangeRequest request) {
        StoredProcedureQuery query =
                entityManager.createStoredProcedureQuery("sp_change_cif_status");
        query.registerStoredProcedureParameter("p_cif_id", String.class, ParameterMode.IN);
        query.registerStoredProcedureParameter("p_new_status", String.class, ParameterMode.IN);
        query.registerStoredProcedureParameter("p_changed_by", String.class, ParameterMode.IN);
        query.registerStoredProcedureParameter("p_remarks", String.class, ParameterMode.IN);
        query.setParameter("p_cif_id", cifId);
        query.setParameter("p_new_status", request.getNewStatus());
        query.setParameter("p_changed_by", request.getChangedBy());
        query.setParameter("p_remarks", request.getRemarks());
        query.execute();
    }

    // ── Create Draft CIF ───────────────────────────────────────────────────────

//    @Transactional
//    public String createDraftCif(CreateDraftCifRequest request) {
//        StoredProcedureQuery query =
//                entityManager.createStoredProcedureQuery("sp_create_draft_cif");
//        query.registerStoredProcedureParameter("p_first_name", String.class, ParameterMode.IN);
//        query.registerStoredProcedureParameter("p_last_name", String.class, ParameterMode.IN);
//        query.registerStoredProcedureParameter("p_dob", Date.class, ParameterMode.IN);
//        query.registerStoredProcedureParameter("p_pan_no", String.class, ParameterMode.IN);
//        query.registerStoredProcedureParameter("p_mobile_no", String.class, ParameterMode.IN);
//        query.registerStoredProcedureParameter("p_email", String.class, ParameterMode.IN);
//        query.registerStoredProcedureParameter("p_created_by", String.class, ParameterMode.IN);
//        query.registerStoredProcedureParameter("p_cif_id", String.class, ParameterMode.OUT);
//        query.setParameter("p_first_name", request.getFirstName());
//        query.setParameter("p_last_name", request.getLastName());
//        query.setParameter("p_dob", Date.valueOf(request.getDob()));
//        query.setParameter("p_pan_no", request.getPanNo());
//        query.setParameter("p_mobile_no", request.getMobileNo());
//        query.setParameter("p_email", request.getEmail());
//        query.setParameter("p_created_by", request.getCreatedBy());
//        query.execute();
//        return (String) query.getOutputParameterValue("p_cif_id");
//    }

    // ── Replace createDraftCif() in CustomerServiceImpl.java ─────────────────────

    @Transactional
    public String createDraftCif(CreateDraftCifRequest request) {
        StoredProcedureQuery query =
                entityManager.createStoredProcedureQuery("sp_create_draft_cif");

        query.registerStoredProcedureParameter("p_first_name", String.class, ParameterMode.IN);
        query.registerStoredProcedureParameter("p_last_name", String.class, ParameterMode.IN);
        query.registerStoredProcedureParameter("p_dob", Date.class, ParameterMode.IN);
        query.registerStoredProcedureParameter("p_pan_no", String.class, ParameterMode.IN);
        query.registerStoredProcedureParameter("p_mobile_no", String.class, ParameterMode.IN);
        query.registerStoredProcedureParameter("p_email", String.class, ParameterMode.IN);
        query.registerStoredProcedureParameter("p_created_by", String.class, ParameterMode.IN);
        query.registerStoredProcedureParameter("p_branch_id", String.class, ParameterMode.IN);
        query.registerStoredProcedureParameter("p_middle_name", String.class, ParameterMode.IN);
        query.registerStoredProcedureParameter("p_salutation", String.class, ParameterMode.IN);
        query.registerStoredProcedureParameter("p_customer_type", String.class, ParameterMode.IN);
        query.registerStoredProcedureParameter("p_customer_sub_type", String.class, ParameterMode.IN);
        query.registerStoredProcedureParameter("p_cif_id", String.class, ParameterMode.OUT);

        query.setParameter("p_first_name", request.getFirstName());
        query.setParameter("p_last_name", request.getLastName());
        query.setParameter("p_dob", Date.valueOf(request.getDob()));
        query.setParameter("p_pan_no", request.getPanNo());
        query.setParameter("p_mobile_no", request.getMobileNo());
        query.setParameter("p_email", request.getEmail());
        query.setParameter("p_created_by", request.getCreatedBy());
        query.setParameter("p_branch_id", request.getBranchId() != null ? request.getBranchId() : "BR001");
        query.setParameter("p_middle_name", request.getMiddlename() != null ? request.getMiddlename() : "");
        query.setParameter("p_salutation", request.getSalutation() != null ? request.getSalutation() : "");
        query.setParameter("p_customer_type", request.getCustomertype() != null ? request.getCustomertype() : "INDIVIDUAL");
        query.setParameter("p_customer_sub_type", request.getCustomerSubType() != null ? request.getCustomerSubType() : "");

        query.execute();
        return (String) query.getOutputParameterValue("p_cif_id");
    }
    // ── Update Basic Info ─────────────────────────────────────────────────────

    @Transactional
    public void updateBasicInfo(String cifId, UpdateBasicInfoRequest request) {
        int updated = entityManager.createNativeQuery("""
                        UPDATE TB_CIF_MASTER
                        SET first_name       = :firstName,
                            last_name        = :lastName,
                            mobile_no        = :mobile,
                            email            = :email,
                            onboarding_stage = 'BASIC_INFO',
                            updated_at       = CURRENT_TIMESTAMP
                        WHERE cif_id    = :cifId
                        AND cif_status != 'CLOSED'
                        """)
                .setParameter("firstName", request.getFirstName())
                .setParameter("lastName", request.getLastName())
                .setParameter("mobile", request.getMobileNo())
                .setParameter("email", request.getEmail())
                .setParameter("cifId", cifId)
                .executeUpdate();

        if (updated == 0)
            throw new CustomerNotFoundException(cifId);
    }

    // ── Add Address ────────────────────────────────────────────────────────────
    // Stage: ADDRESS → NOMINEE

    @Transactional
    public void addAddress(String cifId, AddressRequest request) {
        entityManager.createNativeQuery("""
                        INSERT INTO TB_CIF_ADDRESS (
                            ADDRESS_ID, CIF_ID, ADDRESS_TYPE,
                            ADDRESS_LINE1, ADDRESS_LINE2,
                            CITY, STATE, POSTAL_CODE, COUNTRY
                        ) VALUES (
                            FN_GENERATE_ADDRESS(), :cifId, :type,
                            :line1, :line2,
                            :city, :state, :postal, :country
                        )
                        """)
                .setParameter("cifId", cifId)
                .setParameter("type", request.getAddressType())
                .setParameter("line1", request.getAddressLine1())
                .setParameter("line2", request.getAddressLine2())
                .setParameter("city", request.getCity())
                .setParameter("state", request.getState())
                .setParameter("postal", request.getPostalCode())
                .setParameter("country", request.getCountry())
                .executeUpdate();

        entityManager.createNativeQuery("""
                        UPDATE TB_CIF_MASTER
                        SET onboarding_stage = 'NOMINEE',
                            updated_at       = CURRENT_TIMESTAMP
                        WHERE cif_id    = :cifId
                        AND cif_status != 'CLOSED'
                        """)
                .setParameter("cifId", cifId)
                .executeUpdate();
    }

    // ── Update Address (modify existing) ──────────────────────────────────────

    @Transactional
    public void updateAddress(String cifId, AddressRequest request) {
        entityManager.createNativeQuery("""
                        UPDATE TB_CIF_MASTER
                        SET onboarding_stage = 'NOMINEE',
                            updated_at       = CURRENT_TIMESTAMP
                        WHERE cif_id    = :cifId
                        AND cif_status != 'CLOSED'
                        """)
                .setParameter("cifId", cifId)
                .executeUpdate();
    }

    // ── Add Nominee ───────────────────────────────────────────────────────────
    // Stage: → NOMINEE

    @Transactional
    public void addNominee(String cifId, NomineeRequest request) {
        entityManager.createNativeQuery("""
                        INSERT INTO TB_NOMINEE_DETAILS (
                            cif_id, nominee_name, dob, relation,
                            phone, email, aadhaar_number, pan_number,
                            address_line1, address_line2, city, state,
                            postal_code, country, created_by
                        ) VALUES (
                            :cifId, :nomineeName, :dob, :relation,
                            :phone, :email, :aadhaarNumber, :panNumber,
                            :addressLine1, :addressLine2, :city, :state,
                            :postalCode, :country, :createdBy
                        )
                        """)
                .setParameter("cifId", cifId)
                .setParameter("nomineeName", request.getNomineeName())
                .setParameter("dob", request.getDob() != null && !request.getDob().isEmpty()
                        ? java.sql.Date.valueOf(request.getDob()) : null)
                .setParameter("relation", request.getRelation())
                .setParameter("phone", request.getPhone())
                .setParameter("email", request.getEmail())
                .setParameter("aadhaarNumber", request.getAadhaarNumber())
                .setParameter("panNumber", request.getPanNumber())
                .setParameter("addressLine1", request.getAddressLine1())
                .setParameter("addressLine2", request.getAddressLine2())
                .setParameter("city", request.getCity())
                .setParameter("state", request.getState())
                .setParameter("postalCode", request.getPostalCode())
                .setParameter("country", request.getCountry() != null ? request.getCountry() : "India")
                .setParameter("createdBy", request.getCreatedBy())
                .executeUpdate();

        entityManager.createNativeQuery("""
                        UPDATE TB_CIF_MASTER
                        SET onboarding_stage = 'NOMINEE',
                            updated_at       = CURRENT_TIMESTAMP
                        WHERE cif_id    = :cifId
                        AND cif_status != 'CLOSED'
                        """)
                .setParameter("cifId", cifId)
                .executeUpdate();
    }

    // ── Add Income ────────────────────────────────────────────────────────────
    // Stage: NOMINEE → KYC

    @Transactional
    public void addIncome(String cifId, IncomeRequest request) {
        entityManager.createNativeQuery("""
                        INSERT INTO TB_INCOME_DETAILS (
                            cif_id, income_source, annual_income,
                            employer_name, employer_address, employer_city,
                            employer_state, employer_pincode,
                            itr_filed, itr_year, itr_amount,
                            bank_account_number, bank_name, bank_ifsc, bank_branch,
                            created_by
                        ) VALUES (
                            :cifId, :incomeSource, :annualIncome,
                            :employerName, :employerAddress, :employerCity,
                            :employerState, :employerPincode,
                            :itrFiled, :itrYear, :itrAmount,
                            :bankAccountNumber, :bankName, :bankIfsc, :bankBranch,
                            :createdBy
                        )
                        """)
                .setParameter("cifId", cifId)
                .setParameter("incomeSource", request.getIncomeSource())
                .setParameter("annualIncome", request.getAnnualIncome())
                .setParameter("employerName", request.getEmployerName())
                .setParameter("employerAddress", request.getEmployerAddress())
                .setParameter("employerCity", request.getEmployerCity())
                .setParameter("employerState", request.getEmployerState())
                .setParameter("employerPincode", request.getEmployerPincode())
                .setParameter("itrFiled", request.getItrFiled() != null ? request.getItrFiled() : false)
                .setParameter("itrYear", request.getItrYear())
                .setParameter("itrAmount", request.getItrAmount())
                .setParameter("bankAccountNumber", request.getBankAccountNumber())
                .setParameter("bankName", request.getBankName())
                .setParameter("bankIfsc", request.getBankIfsc())
                .setParameter("bankBranch", request.getBankBranch())
                .setParameter("createdBy", request.getCreatedBy())
                .executeUpdate();

        // NOMINEE → KYC so addKyc WHERE works correctly
        entityManager.createNativeQuery("""
                        UPDATE TB_CIF_MASTER
                        SET onboarding_stage = 'KYC',
                            updated_at       = CURRENT_TIMESTAMP
                        WHERE cif_id    = :cifId
                        AND cif_status != 'CLOSED'
                        """)
                .setParameter("cifId", cifId)
                .executeUpdate();
    }

    // ── Add KYC ───────────────────────────────────────────────────────────────
    // Stage: KYC → RISK

    @Transactional
    public void addKyc(String cifId, KycRequest request) {
        entityManager.createNativeQuery("""
                        INSERT INTO TB_KYC_DETAILS (
                            KYC_ID, CIF_ID, PAN_NUMBER, AADHAAR_NUMBER, KYC_TYPE
                        ) VALUES (
                            'KYC' || nextval('SEQ_KYC'),
                            :cifId, :pan, :aadhaar, :type
                        )
                        """)
                .setParameter("cifId", cifId)
                .setParameter("pan", request.getPanNumber())
                .setParameter("aadhaar", request.getAadhaarNumber())
                .setParameter("type", request.getKycType())
                .executeUpdate();

        entityManager.createNativeQuery("""
                        UPDATE TB_CIF_MASTER
                        SET onboarding_stage = 'RISK',
                            updated_at       = CURRENT_TIMESTAMP
                        WHERE cif_id    = :cifId
                        AND cif_status != 'CLOSED'
                        """)
                .setParameter("cifId", cifId)
                .executeUpdate();
    }

    // ── Add Risk ──────────────────────────────────────────────────────────────
    // Stage: RISK → FINAL_APPROVAL

    @Transactional
    public void addRisk(String cifId, RiskRequest request) {
        entityManager.createNativeQuery("""
                        INSERT INTO TB_RISK_PROFILE (
                            RISK_ID, CIF_ID, INCOME_RANGE,
                            OCCUPATION, POLITICALLY_EXPOSED_PERSON, RISK_CATEGORY
                        ) VALUES (
                            'RISK' || nextval('SEQ_RISK'),
                            :cifId, :income, :occupation, :pep, :risk
                        )
                        """)
                .setParameter("cifId", cifId)
                .setParameter("income", request.getIncomeRange())
                .setParameter("occupation", request.getOccupation())
                .setParameter("pep", request.getPoliticallyExposedPerson())
                .setParameter("risk", request.getRiskCategory())
                .executeUpdate();

        entityManager.createNativeQuery("""
                        UPDATE TB_CIF_MASTER
                        SET onboarding_stage = 'FINAL_APPROVAL',
                            updated_at       = CURRENT_TIMESTAMP
                        WHERE cif_id    = :cifId
                        AND cif_status != 'CLOSED'
                        """)
                .setParameter("cifId", cifId)
                .executeUpdate();
    }

    // ── Submit for Review ─────────────────────────────────────────────────────

    @Transactional
    public void submitForReview(String cifId) {
        int updated = entityManager.createNativeQuery("""
                        UPDATE TB_CIF_MASTER
                        SET cif_status = 'UNDER_REVIEW',
                            updated_at = CURRENT_TIMESTAMP
                        WHERE cif_id = :cifId
                        AND (
                            onboarding_stage = 'FINAL_APPROVAL'
                            OR cif_status IN ('REJECTED', 'CHANGES_REQUESTED')
                        )
                        """)
                .setParameter("cifId", cifId)
                .executeUpdate();

        if (updated == 0)
            throw new CifSubmissionException(cifId);
    }

    // ── Save Signature ────────────────────────────────────────────────────────

    @Transactional
    public void saveSignature(String cifId, SignatureRequest request) {
        int updated = entityManager.createNativeQuery("""
                        UPDATE TB_CIF_MASTER
                        SET signature_data = :signatureData,
                            signature_type = :signatureType,
                            signature_date = CURRENT_TIMESTAMP,
                            updated_at     = CURRENT_TIMESTAMP
                        WHERE cif_id = :cifId
                        """)
                .setParameter("signatureData", request.getSignatureData())
                .setParameter("signatureType", request.getSignatureType())
                .setParameter("cifId", cifId)
                .executeUpdate();

        if (updated == 0)
            throw new CustomerNotFoundException(cifId);
    }

    // ── Close CIF ─────────────────────────────────────────────────────────────

    @Transactional
    public void closeCif(String cifId, String remarks) {
        int updated = entityManager.createNativeQuery("""
                        UPDATE TB_CIF_MASTER
                        SET cif_status    = 'CLOSED',
                            close_remarks = :remarks,
                            updated_at    = CURRENT_TIMESTAMP
                        WHERE cif_id    = :cifId
                        AND cif_status != 'CLOSED'
                        """)
                .setParameter("remarks", remarks)
                .setParameter("cifId", cifId)
                .executeUpdate();

        if (updated == 0)
            throw new CifAlreadyClosedException(cifId);
    }

    // ── Modify Basic Info ─────────────────────────────────────────────────────

    @Transactional
    public void modifyBasicInfo(String cifId, UpdateBasicInfoRequest request) {
        int updated = entityManager.createNativeQuery("""
                        UPDATE TB_CIF_MASTER
                        SET first_name = :firstName,
                            last_name  = :lastName,
                            mobile_no  = :mobile,
                            email      = :email,
                            updated_at = CURRENT_TIMESTAMP
                        WHERE cif_id = :cifId
                        """)
                .setParameter("firstName", request.getFirstName())
                .setParameter("lastName", request.getLastName())
                .setParameter("mobile", request.getMobileNo())
                .setParameter("email", request.getEmail())
                .setParameter("cifId", cifId)
                .executeUpdate();

        if (updated == 0)
            throw new CustomerNotFoundException(cifId);
    }

    // ── Modify Address ────────────────────────────────────────────────────────

    @Transactional
    public void modifyAddress(String cifId, AddressRequest request) {
        int updated = entityManager.createNativeQuery("""
                        UPDATE TB_CIF_ADDRESS
                        SET address_type  = :type,
                            address_line1 = :line1,
                            address_line2 = :line2,
                            city          = :city,
                            state         = :state,
                            postal_code   = :postal,
                            country       = :country
                        WHERE cif_id = :cifId
                        """)
                .setParameter("type", request.getAddressType())
                .setParameter("line1", request.getAddressLine1())
                .setParameter("line2", request.getAddressLine2())
                .setParameter("city", request.getCity())
                .setParameter("state", request.getState())
                .setParameter("postal", request.getPostalCode())
                .setParameter("country", request.getCountry())
                .setParameter("cifId", cifId)
                .executeUpdate();

        if (updated == 0)
            throw new AddressNotFoundException(cifId);
    }

    // ── Modify KYC ────────────────────────────────────────────────────────────

    @Transactional
    public void modifyKyc(String cifId, KycRequest request) {
        int updated = entityManager.createNativeQuery("""
                        UPDATE TB_KYC_DETAILS
                        SET pan_number     = :pan,
                            aadhaar_number = :aadhaar,
                            kyc_type       = :type
                        WHERE cif_id = :cifId
                        """)
                .setParameter("pan", request.getPanNumber())
                .setParameter("aadhaar", request.getAadhaarNumber())
                .setParameter("type", request.getKycType())
                .setParameter("cifId", cifId)
                .executeUpdate();

        if (updated == 0)
            throw new KycNotFoundException(cifId);
    }

    // ── Modify Risk ───────────────────────────────────────────────────────────

    @Transactional
    public void modifyRisk(String cifId, RiskRequest request) {
        int updated = entityManager.createNativeQuery("""
                        UPDATE TB_RISK_PROFILE
                        SET income_range               = :income,
                            occupation                 = :occupation,
                            politically_exposed_person = :pep,
                            risk_category              = :risk
                        WHERE cif_id = :cifId
                        """)
                .setParameter("income", request.getIncomeRange())
                .setParameter("occupation", request.getOccupation())
                .setParameter("pep", request.getPoliticallyExposedPerson())
                .setParameter("risk", request.getRiskCategory())
                .setParameter("cifId", cifId)
                .executeUpdate();

        if (updated == 0)
            throw new RiskProfileNotFoundException(cifId);
    }

    // ── Get All Customers ─────────────────────────────────────────────────────

    @Transactional
    public List<Map<String, Object>> getAllCustomers() {
        List<Object[]> rows = entityManager.createNativeQuery("""
                SELECT
                    cif_id, first_name, last_name,
                    pan_no, mobile_no, cif_status,
                    onboarding_stage, created_date, created_by,
                    close_remarks
                FROM TB_CIF_MASTER
                ORDER BY created_date DESC
                """).getResultList();

        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : rows) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("cif_id", row[0]);
            map.put("first_name", row[1]);
            map.put("last_name", row[2]);
            map.put("pan_no", row[3]);
            map.put("mobile_no", row[4]);
            map.put("cif_status", row[5]);
            map.put("onboarding_stage", row[6]);
            map.put("created_date", row[7]);
            map.put("created_by", row[8]);
            map.put("close_remarks", row[9]);
            result.add(map);
        }
        return result;
    }

    // ── Get Pending Approvals ─────────────────────────────────────────────────

    @Transactional
    public List<Map<String, Object>> getPendingApprovals() {
        List<Object[]> rows = entityManager.createNativeQuery("""
                SELECT
                    cif_id, first_name, last_name,
                    pan_no, mobile_no, cif_status,
                    onboarding_stage, created_date, created_by
                FROM TB_CIF_MASTER
                WHERE cif_status = 'UNDER_REVIEW'
                ORDER BY created_date DESC
                """).getResultList();

        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : rows) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("cif_id", row[0]);
            map.put("first_name", row[1]);
            map.put("last_name", row[2]);
            map.put("pan_no", row[3]);
            map.put("mobile_no", row[4]);
            map.put("cif_status", row[5]);
            map.put("onboarding_stage", row[6]);
            map.put("created_date", row[7]);
            map.put("created_by", row[8]);
            result.add(map);
        }
        return result;
    }

    // ── Get Customer Details ──────────────────────────────────────────────────

    @Transactional
    public Map<String, Object> getCustomerDetails(String cifId) {
        List<Object[]> masterRows = entityManager.createNativeQuery("""
                        SELECT
                            cif_id, first_name, last_name, dob, pan_no,
                            mobile_no, email, cif_status, onboarding_stage,
                            kyc_status, risk_category, created_by, created_date,
                            approved_by, close_remarks,
                            followup_status, followup_remarks,
                            followup_updated_at, followup_updated_by,
                            signature_data, signature_type, signature_date,
                            branch_id
                        FROM TB_CIF_MASTER
                        WHERE cif_id = :cifId
                        """)
                .setParameter("cifId", cifId)
                .getResultList();

        if (masterRows.isEmpty())
            throw new CustomerNotFoundException(cifId);

        Object[] m = masterRows.get(0);
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("cif_id", m[0]);
        result.put("first_name", m[1]);
        result.put("last_name", m[2]);
        result.put("dob", m[3]);
        result.put("pan_no", m[4]);
        result.put("mobile_no", m[5]);
        result.put("email", m[6]);
        result.put("cif_status", m[7]);
        result.put("onboarding_stage", m[8]);
        result.put("kyc_status", m[9]);
        result.put("risk_category", m[10]);
        result.put("created_by", m[11]);
        result.put("created_date", m[12]);
        result.put("approved_by", m[13]);
        result.put("close_remarks", m[14]);
        result.put("followup_status", m[15]);
        result.put("followup_remarks", m[16]);
        result.put("followup_updated_at", m[17]);
        result.put("followup_updated_by", m[18]);
        result.put("signature_data", m[19]);
        result.put("signature_type", m[20]);
        result.put("signature_date", m[21]);
        result.put("branch_id", m[22]);

        // Addresses
        List<Object[]> addrRows = entityManager.createNativeQuery("""
                SELECT address_type, address_line1, address_line2,
                       city, state, postal_code, country
                FROM TB_CIF_ADDRESS WHERE cif_id = :cifId
                """).setParameter("cifId", cifId).getResultList();
        List<Map<String, Object>> addresses = new ArrayList<>();
        for (Object[] a : addrRows) {
            Map<String, Object> addr = new LinkedHashMap<>();
            addr.put("address_type", a[0]);
            addr.put("address_line1", a[1]);
            addr.put("address_line2", a[2]);
            addr.put("city", a[3]);
            addr.put("state", a[4]);
            addr.put("postal_code", a[5]);
            addr.put("country", a[6]);
            addresses.add(addr);
        }
        result.put("addresses", addresses);

        // KYC
        List<Object[]> kycRows = entityManager.createNativeQuery("""
                SELECT kyc_id, pan_number, aadhaar_number, kyc_type
                FROM TB_KYC_DETAILS WHERE cif_id = :cifId
                """).setParameter("cifId", cifId).getResultList();
        List<Map<String, Object>> kycList = new ArrayList<>();
        for (Object[] k : kycRows) {
            Map<String, Object> kyc = new LinkedHashMap<>();
            kyc.put("kyc_id", k[0]);
            kyc.put("pan_number", k[1]);
            kyc.put("aadhaar_number", k[2]);
            kyc.put("kyc_type", k[3]);
            kycList.add(kyc);
        }
        result.put("kyc", kycList);

        // Risk
        List<Object[]> riskRows = entityManager.createNativeQuery("""
                SELECT risk_id, income_range, occupation,
                       politically_exposed_person, risk_category
                FROM TB_RISK_PROFILE WHERE cif_id = :cifId
                """).setParameter("cifId", cifId).getResultList();
        if (!riskRows.isEmpty()) {
            Object[] r = riskRows.get(0);
            Map<String, Object> risk = new LinkedHashMap<>();
            risk.put("risk_id", r[0]);
            risk.put("income_range", r[1]);
            risk.put("occupation", r[2]);
            risk.put("politically_exposed_person", r[3]);
            risk.put("risk_category", r[4]);
            result.put("risk", risk);
        }

        // Nominee
        List<Object[]> nomineeRows = entityManager.createNativeQuery("""
                SELECT nominee_id, nominee_name, dob, relation,
                       phone, email, pan_number, aadhaar_number,
                       address_line1, address_line2, city, state, postal_code, country
                FROM TB_NOMINEE_DETAILS WHERE cif_id = :cifId
                """).setParameter("cifId", cifId).getResultList();
        List<Map<String, Object>> nominees = new ArrayList<>();
        for (Object[] n : nomineeRows) {
            Map<String, Object> nominee = new LinkedHashMap<>();
            nominee.put("nominee_id", n[0]);
            nominee.put("nominee_name", n[1]);
            nominee.put("dob", n[2]);
            nominee.put("relation", n[3]);
            nominee.put("phone", n[4]);
            nominee.put("email", n[5]);
            nominee.put("pan_number", n[6]);
            nominee.put("aadhaar_number", n[7]);
            nominee.put("address_line1", n[8]);
            nominee.put("address_line2", n[9]);
            nominee.put("city", n[10]);
            nominee.put("state", n[11]);
            nominee.put("postal_code", n[12]);
            nominee.put("country", n[13]);
            nominees.add(nominee);
        }
        result.put("nominees", nominees);

        // Income
        List<Object[]> incomeRows = entityManager.createNativeQuery("""
                SELECT income_id, income_source, annual_income,
                       employer_name, employer_address, employer_city,
                       employer_state, employer_pincode,
                       itr_filed, itr_year, itr_amount,
                       bank_account_number, bank_name, bank_ifsc, bank_branch
                FROM TB_INCOME_DETAILS WHERE cif_id = :cifId
                """).setParameter("cifId", cifId).getResultList();
        if (!incomeRows.isEmpty()) {
            Object[] i = incomeRows.get(0);
            Map<String, Object> income = new LinkedHashMap<>();
            income.put("income_id", i[0]);
            income.put("income_source", i[1]);
            income.put("annual_income", i[2]);
            income.put("employer_name", i[3]);
            income.put("employer_address", i[4]);
            income.put("employer_city", i[5]);
            income.put("employer_state", i[6]);
            income.put("employer_pincode", i[7]);
            income.put("itr_filed", i[8]);
            income.put("itr_year", i[9]);
            income.put("itr_amount", i[10]);
            income.put("bank_account_number", i[11]);
            income.put("bank_name", i[12]);
            income.put("bank_ifsc", i[13]);
            income.put("bank_branch", i[14]);
            result.put("income", income);
        }

        return result;
    }

    // ── Dashboard Stats ───────────────────────────────────────────────────────

    @Transactional
    public Map<String, Object> getDashboardStats() {
        List<Object[]> rows = entityManager.createNativeQuery("""
                SELECT
                    COUNT(*)                                                  AS total,
                    COUNT(CASE WHEN cif_status = 'DRAFT'        THEN 1 END)  AS draft,
                    COUNT(CASE WHEN cif_status = 'UNDER_REVIEW' THEN 1 END)  AS under_review,
                    COUNT(CASE WHEN cif_status = 'APPROVED'     THEN 1 END)  AS approved,
                    COUNT(CASE WHEN cif_status = 'REJECTED'     THEN 1 END)  AS rejected
                FROM TB_CIF_MASTER
                """).getResultList();
        Object[] r = rows.get(0);
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("total", r[0]);
        stats.put("draft", r[1]);
        stats.put("under_review", r[2]);
        stats.put("approved", r[3]);
        stats.put("rejected", r[4]);
        return stats;
    }

    // ── Recent Customers ──────────────────────────────────────────────────────

    public List<Map<String, Object>> getRecentCustomers() {
        List<Object[]> rows = entityManager.createNativeQuery("""
                SELECT cif_id, first_name, last_name,
                       cif_status, created_date, created_by
                FROM TB_CIF_MASTER
                ORDER BY created_date DESC LIMIT 5
                """).getResultList();
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : rows) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("cif_id", row[0]);
            map.put("first_name", row[1]);
            map.put("last_name", row[2]);
            map.put("cif_status", row[3]);
            map.put("created_date", row[4]);
            map.put("created_by", row[5]);
            result.add(map);
        }
        return result;
    }

    // ── Auto-detect Follow-up Status ──────────────────────────────────────────

    @Transactional
    public String autoDetectFollowupStatus(String cifId) {
        List<Object[]> rows = entityManager.createNativeQuery(
                "SELECT fn_auto_detect_followup(:cifId)"
        ).setParameter("cifId", cifId).getResultList();
        return rows.isEmpty() ? "NORMAL" : (String) rows.get(0)[0];
    }

    // ── Update Follow-up Status ───────────────────────────────────────────────

    @Transactional
    public void updateFollowupStatus(String cifId, FollowupStatusRequest request) {
        entityManager.createStoredProcedureQuery("sp_update_followup_status")
                .registerStoredProcedureParameter("p_cif_id", String.class, ParameterMode.IN)
                .registerStoredProcedureParameter("p_status", String.class, ParameterMode.IN)
                .registerStoredProcedureParameter("p_remarks", String.class, ParameterMode.IN)
                .registerStoredProcedureParameter("p_updated_by", String.class, ParameterMode.IN)
                .registerStoredProcedureParameter("p_is_manual", Boolean.class, ParameterMode.IN)
                .setParameter("p_cif_id", cifId)
                .setParameter("p_status", request.getStatus())
                .setParameter("p_remarks", request.getRemarks())
                .setParameter("p_updated_by", request.getUpdatedBy())
                .setParameter("p_is_manual", true)
                .execute();
    }

    // ── Get Follow-up Status Master ───────────────────────────────────────────

    public List<Map<String, Object>> getFollowupStatusMaster() {
        List<Object[]> rows = entityManager.createNativeQuery("""
                SELECT status_code, status_name, description, severity
                FROM TB_FOLLOWUP_STATUS_MASTER WHERE is_active = true
                """).getResultList();
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : rows) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("status_code", row[0]);
            map.put("status_name", row[1]);
            map.put("description", row[2]);
            map.put("severity", row[3]);
            result.add(map);
        }
        return result;
    }

    // ── Submit Modification Request ───────────────────────────────────────────

    @Transactional
    public String submitModificationRequest(String cifId, String section,
                                            String oldData, String newData, String requestedBy) {
        String requestId = "MOD" + String.format("%06d",
                ((Number) entityManager.createNativeQuery(
                        "SELECT nextval('SEQ_MOD_REQUEST')"
                ).getSingleResult()).longValue());

        entityManager.createNativeQuery("""
                        INSERT INTO TB_CIF_MODIFICATION_REQUEST
                            (request_id, cif_id, section, old_data, new_data, status, requested_by)
                        VALUES
                            (:reqId, :cifId, :section, :oldData, :newData, 'PENDING', :reqBy)
                        """)
                .setParameter("reqId", requestId)
                .setParameter("cifId", cifId)
                .setParameter("section", section)
                .setParameter("oldData", oldData)
                .setParameter("newData", newData)
                .setParameter("reqBy", requestedBy)
                .executeUpdate();

        entityManager.createNativeQuery("""
                        UPDATE TB_CIF_MASTER
                        SET cif_status = 'PENDING_MODIFICATION',
                            updated_at = CURRENT_TIMESTAMP
                        WHERE cif_id    = :cifId
                        AND cif_status != 'CLOSED'
                        """)
                .setParameter("cifId", cifId)
                .executeUpdate();

        return requestId;
    }

    // ── Get Pending Modifications ─────────────────────────────────────────────

    public List<Map<String, Object>> getPendingModifications() {
        List<Object[]> rows = entityManager.createNativeQuery("""
                SELECT r.request_id, r.cif_id, r.section,
                       r.old_data, r.new_data, r.status,
                       r.requested_by, r.requested_at,
                       m.first_name, m.last_name
                FROM TB_CIF_MODIFICATION_REQUEST r
                JOIN TB_CIF_MASTER m ON r.cif_id = m.cif_id
                WHERE r.status = 'PENDING'
                ORDER BY r.requested_at DESC
                """).getResultList();
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : rows) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("request_id", row[0]);
            map.put("cif_id", row[1]);
            map.put("section", row[2]);
            map.put("old_data", row[3]);
            map.put("new_data", row[4]);
            map.put("status", row[5]);
            map.put("requested_by", row[6]);
            map.put("requested_at", row[7]);
            map.put("first_name", row[8]);
            map.put("last_name", row[9]);
            result.add(map);
        }
        return result;
    }

    // ── Get Modifications by CIF ──────────────────────────────────────────────

    public List<Map<String, Object>> getModificationsByCif(String cifId) {
        List<Object[]> rows = entityManager.createNativeQuery("""
                        SELECT request_id, cif_id, section,
                               old_data, new_data, status,
                               requested_by, requested_at,
                               reviewed_by, reviewed_at, review_remarks
                        FROM TB_CIF_MODIFICATION_REQUEST
                        WHERE cif_id = :cifId
                        ORDER BY requested_at DESC
                        """)
                .setParameter("cifId", cifId)
                .getResultList();
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : rows) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("request_id", row[0]);
            map.put("cif_id", row[1]);
            map.put("section", row[2]);
            map.put("old_data", row[3]);
            map.put("new_data", row[4]);
            map.put("status", row[5]);
            map.put("requested_by", row[6]);
            map.put("requested_at", row[7]);
            map.put("reviewed_by", row[8]);
            map.put("reviewed_at", row[9]);
            map.put("review_remarks", row[10]);
            result.add(map);
        }
        return result;
    }

    // ── Review Modification ───────────────────────────────────────────────────

    @Transactional
    public void reviewModification(String requestId, ModificationReviewRequest request) throws Exception {
        List<Object[]> rows = entityManager.createNativeQuery("""
                        SELECT cif_id, section, new_data
                        FROM TB_CIF_MODIFICATION_REQUEST
                        WHERE request_id = :reqId AND status = 'PENDING'
                        """)
                .setParameter("reqId", requestId)
                .getResultList();

        if (rows.isEmpty())
            throw new ModificationRequestNotFoundException(requestId);

        Object[] row = rows.get(0);
        String cifId = (String) row[0];
        String section = (String) row[1];
        String newData = (String) row[2];

        entityManager.createNativeQuery("""
                        UPDATE TB_CIF_MODIFICATION_REQUEST
                        SET status         = :status,
                            reviewed_by    = :reviewedBy,
                            reviewed_at    = CURRENT_TIMESTAMP,
                            review_remarks = :remarks
                        WHERE request_id   = :reqId
                        """)
                .setParameter("status", request.getAction())
                .setParameter("reviewedBy", request.getReviewedBy())
                .setParameter("remarks", request.getRemarks())
                .setParameter("reqId", requestId)
                .executeUpdate();

        if ("APPROVE".equals(request.getAction())) {
            applyModification(cifId, section, newData);
        }

        // If no more pending modifications → restore to APPROVED
        Long count = (Long) entityManager.createNativeQuery("""
                        SELECT COUNT(*) FROM TB_CIF_MODIFICATION_REQUEST
                        WHERE cif_id = :cifId AND status = 'PENDING'
                        """)
                .setParameter("cifId", cifId)
                .getSingleResult();

        if (count == 0) {
            entityManager.createNativeQuery("""
                            UPDATE TB_CIF_MASTER
                            SET cif_status = 'APPROVED',
                                updated_at = CURRENT_TIMESTAMP
                            WHERE cif_id   = :cifId
                            AND cif_status = 'PENDING_MODIFICATION'
                            """)
                    .setParameter("cifId", cifId)
                    .executeUpdate();
        }
    }

    // ── Apply Modification ────────────────────────────────────────────────────

    @Transactional
    public void applyModification(String cifId, String section, String newDataJson) throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        Map<String, Object> data = mapper.readValue(newDataJson, Map.class);

        switch (section) {
            case "BASIC_INFO" -> entityManager.createNativeQuery("""
                            UPDATE TB_CIF_MASTER
                            SET first_name = :firstName, last_name = :lastName,
                                mobile_no  = :mobile,    email     = :email,
                                updated_at = CURRENT_TIMESTAMP
                            WHERE cif_id = :cifId
                            """)
                    .setParameter("firstName", data.get("firstName"))
                    .setParameter("lastName", data.get("lastName"))
                    .setParameter("mobile", data.get("mobileNo"))
                    .setParameter("email", data.get("email"))
                    .setParameter("cifId", cifId)
                    .executeUpdate();

            case "ADDRESS" -> entityManager.createNativeQuery("""
                            UPDATE TB_CIF_ADDRESS
                            SET address_type  = :type,   address_line1 = :line1,
                                address_line2 = :line2,  city          = :city,
                                state         = :state,  postal_code   = :postal,
                                country       = :country
                            WHERE cif_id = :cifId
                            """)
                    .setParameter("type", data.get("addressType"))
                    .setParameter("line1", data.get("addressLine1"))
                    .setParameter("line2", data.get("addressLine2"))
                    .setParameter("city", data.get("city"))
                    .setParameter("state", data.get("state"))
                    .setParameter("postal", data.get("postalCode"))
                    .setParameter("country", data.get("country"))
                    .setParameter("cifId", cifId)
                    .executeUpdate();

            case "KYC" -> entityManager.createNativeQuery("""
                            UPDATE TB_KYC_DETAILS
                            SET pan_number = :pan, aadhaar_number = :aadhaar, kyc_type = :type
                            WHERE cif_id = :cifId
                            """)
                    .setParameter("pan", data.get("panNumber"))
                    .setParameter("aadhaar", data.get("aadhaarNumber"))
                    .setParameter("type", data.get("kycType"))
                    .setParameter("cifId", cifId)
                    .executeUpdate();

            case "RISK" -> entityManager.createNativeQuery("""
                            UPDATE TB_RISK_PROFILE
                            SET income_range = :income, occupation = :occupation,
                                politically_exposed_person = :pep, risk_category = :risk
                            WHERE cif_id = :cifId
                            """)
                    .setParameter("income", data.get("incomeRange"))
                    .setParameter("occupation", data.get("occupation"))
                    .setParameter("pep", data.get("politicallyExposedPerson"))
                    .setParameter("risk", data.get("riskCategory"))
                    .setParameter("cifId", cifId)
                    .executeUpdate();

            case "NOMINEE" -> entityManager.createNativeQuery("""
                            UPDATE TB_NOMINEE_DETAILS
                            SET nominee_name = :name,  dob          = :dob,
                                relation     = :rel,   phone        = :phone,
                                email        = :email, pan_number   = :pan,
                                aadhaar_number = :aadhaar, city     = :city,
                                state        = :state, postal_code  = :postal,
                                country      = :country
                            WHERE cif_id = :cifId
                            """)
                    .setParameter("name", data.get("nomineeName"))
                    .setParameter("dob", data.get("dob") != null
                            ? java.sql.Date.valueOf((String) data.get("dob")) : null)
                    .setParameter("rel", data.get("relation"))
                    .setParameter("phone", data.get("phone"))
                    .setParameter("email", data.get("email"))
                    .setParameter("pan", data.get("panNumber"))
                    .setParameter("aadhaar", data.get("aadhaarNumber"))
                    .setParameter("city", data.get("city"))
                    .setParameter("state", data.get("state"))
                    .setParameter("postal", data.get("postalCode"))
                    .setParameter("country", data.get("country"))
                    .setParameter("cifId", cifId)
                    .executeUpdate();

            case "INCOME" -> entityManager.createNativeQuery("""
                            UPDATE TB_INCOME_DETAILS
                            SET income_source      = :source,  annual_income  = :amount,
                                employer_name      = :emp,     employer_city  = :city,
                                employer_state     = :state,   itr_filed      = :itr,
                                itr_year           = :itrYear, bank_name      = :bank,
                                bank_ifsc          = :ifsc,    bank_account_number = :acct
                            WHERE cif_id = :cifId
                            """)
                    .setParameter("source", data.get("incomeSource"))
                    .setParameter("amount", data.get("annualIncome"))
                    .setParameter("emp", data.get("employerName"))
                    .setParameter("city", data.get("employerCity"))
                    .setParameter("state", data.get("employerState"))
                    .setParameter("itr", data.get("itrFiled"))
                    .setParameter("itrYear", data.get("itrYear"))
                    .setParameter("bank", data.get("bankName"))
                    .setParameter("ifsc", data.get("bankIfsc"))
                    .setParameter("acct", data.get("bankAccountNumber"))
                    .setParameter("cifId", cifId)
                    .executeUpdate();
        }
    }
}