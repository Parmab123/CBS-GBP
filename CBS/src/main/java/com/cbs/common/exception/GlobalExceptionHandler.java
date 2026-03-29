package com.cbs.common.exception;

import com.cbs.customer.exception.*;
import com.cbs.security.dto.ErrorResponse;
import com.cbs.security.exception.AuthException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(AuthException.class)
    public ResponseEntity<ErrorResponse> handleAuth(AuthException ex) {

        ErrorResponse body = new ErrorResponse(
                ex.getError(),
                ex.getMessage(),
                ex.getRemainingAttempts(),
                ex.getRemainingSeconds()
        );

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(body);
    }
    // ── 404 Not Found ──────────────────────────────────────────────────────────

    @ExceptionHandler(CustomerNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleCustomerNotFound(CustomerNotFoundException ex) {
        return build(HttpStatus.NOT_FOUND, ex.getErrorCode(), ex.getMessage());
    }

    @ExceptionHandler(KycNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleKycNotFound(KycNotFoundException ex) {
        return build(HttpStatus.NOT_FOUND, ex.getErrorCode(), ex.getMessage());
    }

    @ExceptionHandler(AddressNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleAddressNotFound(AddressNotFoundException ex) {
        return build(HttpStatus.NOT_FOUND, ex.getErrorCode(), ex.getMessage());
    }

    @ExceptionHandler(RiskProfileNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleRiskNotFound(RiskProfileNotFoundException ex) {
        return build(HttpStatus.NOT_FOUND, ex.getErrorCode(), ex.getMessage());
    }

    @ExceptionHandler(ModificationRequestNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleModNotFound(ModificationRequestNotFoundException ex) {
        return build(HttpStatus.NOT_FOUND, ex.getErrorCode(), ex.getMessage());
    }

    // ── 409 Conflict ───────────────────────────────────────────────────────────

    @ExceptionHandler(DuplicateCustomerException.class)
    public ResponseEntity<Map<String, Object>> handleDuplicate(DuplicateCustomerException ex) {
        return build(HttpStatus.CONFLICT, ex.getErrorCode(), ex.getMessage());
    }

    @ExceptionHandler(CifAlreadyClosedException.class)
    public ResponseEntity<Map<String, Object>> handleAlreadyClosed(CifAlreadyClosedException ex) {
        return build(HttpStatus.CONFLICT, ex.getErrorCode(), ex.getMessage());
    }

    // ── 422 Unprocessable Entity ───────────────────────────────────────────────

    @ExceptionHandler(InvalidCifStatusException.class)
    public ResponseEntity<Map<String, Object>> handleInvalidStatus(InvalidCifStatusException ex) {
        return build(HttpStatus.UNPROCESSABLE_ENTITY, ex.getErrorCode(), ex.getMessage());
    }

    @ExceptionHandler(InvalidOnboardingStageException.class)
    public ResponseEntity<Map<String, Object>> handleInvalidStage(InvalidOnboardingStageException ex) {
        return build(HttpStatus.UNPROCESSABLE_ENTITY, ex.getErrorCode(), ex.getMessage());
    }

    @ExceptionHandler(CifSubmissionException.class)
    public ResponseEntity<Map<String, Object>> handleSubmission(CifSubmissionException ex) {
        return build(HttpStatus.UNPROCESSABLE_ENTITY, ex.getErrorCode(), ex.getMessage());
    }

    @ExceptionHandler(InvalidSignatureException.class)
    public ResponseEntity<Map<String, Object>> handleSignature(InvalidSignatureException ex) {
        return build(HttpStatus.UNPROCESSABLE_ENTITY, ex.getErrorCode(), ex.getMessage());
    }

    // ── 400 Bad Request — @Valid validation failures ───────────────────────────

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
        String errors = ex.getBindingResult().getFieldErrors()
                .stream()
                .map(e -> e.getField() + ": " + e.getDefaultMessage())
                .collect(Collectors.joining(", "));
        return build(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", errors);
    }

    // ── 500 Fallback ───────────────────────────────────────────────────────────

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneral(Exception ex) {
        return build(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR", ex.getMessage());
    }

    // ── Helper ─────────────────────────────────────────────────────────────────

    private ResponseEntity<Map<String, Object>> build(HttpStatus status, String errorCode, String message) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status", status.value());
        body.put("errorCode", errorCode);
        body.put("message", message);
        return ResponseEntity.status(status).body(body);
    }

}