package com.cbs.casa.repo;

import com.cbs.casa.entiity.AccountFacilities;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AccountFacilitiesRepository extends JpaRepository<AccountFacilities, Long> {
    List<AccountFacilities> findByAccountId(String accountId);

    List<AccountFacilities> findByAccountIdAndIsEnabled(String accountId, Boolean isEnabled);
}