package com.cbs.casa.controller;

import com.cbs.casa.dto.CasaAccountRequest;
import com.cbs.casa.dto.CasaStatusRequest;
import com.cbs.casa.services.CasaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/casa")
@RequiredArgsConstructor
public class CasaAccountController {

    private final CasaService casaService;

    @PreAuthorize("hasRole('OFFICER') or hasRole('MANAGER') or hasRole('ADMIN')")
    @PostMapping("/create")
    public ResponseEntity<Map<String, String>> createAccount(
            @RequestBody CasaAccountRequest request) {
        return ResponseEntity.ok(casaService.createCasaAccount(request));
    }

    @PreAuthorize("hasRole('OFFICER') or hasRole('MANAGER') or hasRole('ADMIN')")
    @GetMapping("/cif/{cifId}")
    public ResponseEntity<List<Map<String, Object>>> getAccountsByCif(
            @PathVariable String cifId) {
        return ResponseEntity.ok(casaService.getAccountsByCif(cifId));
    }

    // ── Manager Endpoints ─────────────────────────────────────────────────────

    @PreAuthorize("hasRole('MANAGER') or hasRole('ADMIN')")
    @GetMapping("/pending")
    public ResponseEntity<List<Map<String, Object>>> getPendingApprovals() {
        return ResponseEntity.ok(casaService.getPendingCasaApprovals());
    }

    @PreAuthorize("hasRole('MANAGER') or hasRole('ADMIN')")
    @PutMapping("/{accountId}/status")
    public ResponseEntity<Map<String, String>> updateStatus(
            @PathVariable String accountId,
            @RequestBody CasaStatusRequest request) {
        casaService.updateCasaStatus(accountId, request);
        return ResponseEntity.ok(Map.of("message", "Account status updated to " + request.getNewStatus()));
    }

    // ── Open Endpoints ────────────────────────────────────────────────────────

    @GetMapping("/branches")
    public ResponseEntity<List<Map<String, Object>>> getBranches() {
        return ResponseEntity.ok(casaService.getBranches());
    }

    @GetMapping("/schemes")
    public ResponseEntity<List<Map<String, Object>>> getSchemes(
            @RequestParam(required = false) String accountType) {
        return ResponseEntity.ok(casaService.getSchemes(accountType));
    }
}