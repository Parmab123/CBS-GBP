package com.cbs.casa.repo;

import com.cbs.casa.entiity.AccountTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AccountTransactionRepository
        extends JpaRepository<AccountTransaction, String> {
}