package com.cbs.security.service.impl;

import java.util.logging.Logger;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.cbs.security.service.SmsService;
import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;

@Service
public class SmsServiceImpl implements SmsService {

    Logger log = Logger.getLogger(SmsServiceImpl.class.getName());

    @Value("${twilio.account.sid}")
    private String accountSid;

    @Value("${twilio.auth.token}")
    private String authToken;

    @Value("${twilio.phone.number}")
    private String twilioNumber;

    @Override
    public void sendOtp(String mobile, String otp) {

        Twilio.init(accountSid, authToken);

        Message message = Message.creator(
                new PhoneNumber(mobile),
                new PhoneNumber(twilioNumber),
                "Your OTP is: " + otp
        ).create();

        log.info("OTP sent successfully. SID: " + message.getSid());
    }
}