package com.cbs.casa.repo;

import com.cbs.casa.entiity.AccountStatusLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AccountStatusLogRepository extends JpaRepository<AccountStatusLog, Long> {

    List<AccountStatusLog> findByAccountIdOrderByChangedAtDesc(String accountId);
}