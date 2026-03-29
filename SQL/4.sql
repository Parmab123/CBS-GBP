SELECT * FROM TB_CIF_MODIFICATION_REQUEST;
-- Delete the wrong modification request
DELETE FROM TB_CIF_MODIFICATION_REQUEST WHERE request_id = 'MOD000001';

-- Fix CIF0000002 that got corrupted (null first_name)
UPDATE TB_CIF_MASTER
SET first_name = 'Parmeshwar',
    last_name  = 'Bodake',
    mobile_no  = '08459209346',
    email      = 'bodakeparmeshwar24@gmail.com'
WHERE cif_id = 'CIF0000002';

-- Add to status master
INSERT INTO TB_CIF_STATUS_MASTER (status_code, status_name, is_active)
VALUES ('PENDING_MODIFICATION', 'Pending Modification', true);

-- Add transition rules
INSERT INTO TB_STATUS_TRANSITION_RULES (current_status, next_status, is_allowed)
VALUES
  ('APPROVED', 'PENDING_MODIFICATION', true),
  ('ACTIVE',   'PENDING_MODIFICATION', true),
  ('PENDING_MODIFICATION', 'APPROVED', true),
  ('PENDING_MODIFICATION', 'ACTIVE',   true);

  SELECT m.cif_id, m.first_name, m.last_name, m.pan_no, 
       m.mobile_no, m.email, m.cif_status,
       a.city, a.state
FROM TB_CIF_MASTER m
LEFT JOIN TB_CIF_ADDRESS a ON m.cif_id = a.cif_id
WHERE LOWER(m.first_name || ' ' || m.last_name) LIKE :query
   OR LOWER(m.cif_id)    LIKE :query
   OR LOWER(m.pan_no)    LIKE :query
   OR m.mobile_no        LIKE :query
   OR LOWER(m.email)     LIKE :query
   OR LOWER(a.city)      LIKE :query
   OR LOWER(a.state)     LIKE :query