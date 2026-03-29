SELECT * FROM tb_cif_status_master;
INSERT INTO tb_cif_status_master (status_code, status_name)
VALUES ('CLOSED', 'CIF Account Closed');
ALTER TABLE TB_CIF_MASTER
ADD COLUMN close_remarks TEXT;

SELECT cif_id, cif_status FROM TB_CIF_MASTER WHERE cif_id = 'CIF0000001';
SELECT * FROM TB_STATUS_TRANSITION_RULES;
INSERT INTO TB_STATUS_TRANSITION_RULES (from_status, to_status, is_allowed)
VALUES ('UNDER_REVIEW', 'CHANGES_REQUESTED', true);