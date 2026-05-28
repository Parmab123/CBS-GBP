select * from tb_cif_master;

SELECT * FROM TB_USER_MASTER;
SELECT * FROM TB_CUSTOMER;
sp_create_draft_cif

SELECT prosrc 
FROM pg_proc 
WHERE proname = 'sp_create_draft_cif';

select * from p_cif_id;





CREATE TABLE TB_OTP_SESSION (
    SESSION_ID VARCHAR(255) PRIMARY KEY,
    USER_ID VARCHAR(255),
    USERNAME VARCHAR(255),
    CREATED_AT TIMESTAMP,
    EXPIRES_AT TIMESTAMP
);

select * from TB_OTP_SESSION;

	
select * from tb_user_master;

SELECT * from TB_OTP;
DELETE FROM TB_OTP_SESSION;