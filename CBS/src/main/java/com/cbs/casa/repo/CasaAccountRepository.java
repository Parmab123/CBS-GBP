package com.cbs.casa.repo;

import com.cbs.casa.entiity.CasaAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CasaAccountRepository extends JpaRepository<CasaAccount, String> {


    List<CasaAccount>
    findByCifIdOrderByCreatedDateDesc(String cifId);

    List<CasaAccount>
    findByAccountStatusOrderByCreatedDateDesc(
            String accountStatus
    );

    Optional<CasaAccount>
    findByAccountNumber(String accountNumber);

    boolean existsByCifIdAndAccountTypeAndAccountStatus(
            String cifId,
            String accountType,
            String accountStatus
    );

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
}
