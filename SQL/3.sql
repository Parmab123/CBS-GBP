INSERT INTO TB_STATUS_TRANSITION_RULES (current_status, next_status, is_allowed)
VALUES
  ('REJECTED',           'UNDER_REVIEW', true),
  ('CHANGES_REQUESTED',  'UNDER_REVIEW', true);

  select * from TB_CIF_MASTER;

  -- Table to store pending modifications
CREATE TABLE TB_CIF_MODIFICATION_REQUEST (
    request_id      VARCHAR(30) PRIMARY KEY,
    cif_id          VARCHAR(20) NOT NULL,
    section         VARCHAR(20) NOT NULL,  -- BASIC_INFO, ADDRESS, KYC, RISK
    old_data        TEXT NOT NULL,         -- JSON of original data
    new_data        TEXT NOT NULL,         -- JSON of requested changes
    status          VARCHAR(20) DEFAULT 'PENDING',  -- PENDING, APPROVED, REJECTED
    requested_by    VARCHAR(50) NOT NULL,
    requested_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_by     VARCHAR(50),
    reviewed_at     TIMESTAMP,
    review_remarks  TEXT,
    FOREIGN KEY (cif_id) REFERENCES TB_CIF_MASTER(cif_id)
);

-- Sequence for request ID
CREATE SEQUENCE SEQ_MOD_REQUEST START 1;