package com.cbs.casa.repo;

import com.cbs.casa.entiity.CasaAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CasaAccountRepository extends JpaRepository<CasaAccount, String> {

    // Get all accounts for a CIF
    List<CasaAccount> findByCifIdOrderByCreatedDateDesc(String cifId);

    // Get all pending approvals
    List<CasaAccount> findByAccountStatusOrderByCreatedDateDesc(String accountStatus);

    // Get pending approvals with customer details
    @Query(value = """
            SELECT a.account_id, a.account_number, a.account_type, a.account_status,
                   a.branch_name, a.scheme_name, a.interest_rate,
                   a.initial_deposit, a.is_joint, a.created_by, a.created_date,
                   c.first_name, c.last_name, c.mobile_no, c.pan_no, a.cif_id
            FROM TB_CASA_ACCOUNT a
            JOIN TB_CIF_MASTER c ON a.cif_id = c.cif_id
            WHERE a.account_status = 'PENDING_APPROVAL'
            ORDER BY a.created_date DESC
            """, nativeQuery = true)
    List<Object[]> findPendingApprovalsWithCustomer();

    // Check if CIF has active account of same type
    boolean existsByCifIdAndAccountTypeAndAccountStatus(
            String cifId, String accountType, String accountStatus);
}