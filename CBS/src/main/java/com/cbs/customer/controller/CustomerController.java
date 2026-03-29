package com.cbs.customer.controller;

import com.cbs.customer.dto.*;
import com.cbs.customer.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    // ─── OFFICER ENDPOINTS ────────────────────────────────────────────────────

    @PreAuthorize("hasRole('OFFICER') or hasRole('MANAGER') or hasRole('ADMIN')")
    @PostMapping("/draft")
    public ResponseEntity<?> createDraft(@RequestBody CreateDraftCifRequest request) {
        try {
            System.out.println("[Draft] DOB=" + request.getDob() + " PAN=" + request.getPanNo());
            String cifId = customerService.createDraftCif(request);
            System.out.println("[Draft] Created: " + cifId);
            return ResponseEntity.ok(Map.of("cifId", cifId));
        } catch (Exception e) {
            System.out.println("[Draft] FAILED: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", e.getMessage()));
        }
    }

    @PreAuthorize("hasRole('OFFICER') or hasRole('MANAGER') or hasRole('ADMIN')")
    @PutMapping("/{cifId}/basic-info")
    public ResponseEntity<String> updateBasicInfo(
            @PathVariable String cifId,
            @RequestBody UpdateBasicInfoRequest request) {
        customerService.updateBasicInfo(cifId, request);
        return ResponseEntity.ok("Basic info updated");
    }

    @PreAuthorize("hasRole('OFFICER') or hasRole('MANAGER') or hasRole('ADMIN')")
    @PutMapping("/{cifId}/address")
    public ResponseEntity<String> addAddress(
            @PathVariable String cifId,
            @RequestBody AddressRequest request) {
        customerService.addAddress(cifId, request);
        return ResponseEntity.ok("Address added");
    }

    @PreAuthorize("hasRole('OFFICER') or hasRole('MANAGER') or hasRole('ADMIN')")
    @PutMapping("/{cifId}/kyc")
    public ResponseEntity<String> addKyc(
            @PathVariable String cifId,
            @RequestBody KycRequest request) {
        customerService.addKyc(cifId, request);
        return ResponseEntity.ok("KYC submitted");
    }

    @PreAuthorize("hasRole('OFFICER') or hasRole('MANAGER') or hasRole('ADMIN')")
    @PutMapping("/{cifId}/risk")
    public ResponseEntity<String> addRisk(
            @PathVariable String cifId,
            @RequestBody RiskRequest request) {
        customerService.addRisk(cifId, request);
        return ResponseEntity.ok("Risk profile saved");
    }

    @PreAuthorize("hasRole('OFFICER') or hasRole('MANAGER') or hasRole('ADMIN')")
    @PutMapping("/{cifId}/submit")
    public ResponseEntity<String> submitCustomer(@PathVariable String cifId) {
        customerService.submitForReview(cifId);
        return ResponseEntity.ok("Customer submitted for review");
    }

    @PreAuthorize("hasRole('OFFICER') or hasRole('MANAGER') or hasRole('ADMIN')")
    @PutMapping("/{cifId}/signature")
    public ResponseEntity<String> saveSignature(
            @PathVariable String cifId,
            @RequestBody SignatureRequest request) {
        customerService.saveSignature(cifId, request);
        return ResponseEntity.ok("Signature saved");
    }

    // ─── MANAGER + ADMIN ENDPOINTS ────────────────────────────────────────────

    @PreAuthorize("hasRole('MANAGER') or hasRole('ADMIN')")
    @PutMapping("/{cifId}/approve")
    public ResponseEntity<Map<String, String>> approveCustomer(
            @PathVariable String cifId,
            @RequestBody StatusChangeRequest request) {
        customerService.changeCifStatus(cifId, request);
        return ResponseEntity.ok(Map.of("message", "Status updated to " + request.getNewStatus()));
    }

    @PreAuthorize("hasRole('MANAGER') or hasRole('ADMIN')")
    @PutMapping("/{cifId}/status")
    public ResponseEntity<String> changeStatus(
            @PathVariable String cifId,
            @RequestBody StatusChangeRequest request) {
        customerService.changeCifStatus(cifId, request);
        return ResponseEntity.ok("Status updated");
    }

    @PreAuthorize("hasRole('MANAGER') or hasRole('ADMIN')")
    @GetMapping("/pending-approvals")
    public ResponseEntity<List<Map<String, Object>>> getPendingApprovals() {
        return ResponseEntity.ok(customerService.getPendingApprovals());
    }

    @PreAuthorize("hasRole('MANAGER') or hasRole('ADMIN')")
    @PutMapping("/{cifId}/close")
    public ResponseEntity<String> closeCif(
            @PathVariable String cifId,
            @RequestBody(required = false) Map<String, String> body) {
        String remarks = body != null ? body.get("remarks") : null;
        customerService.closeCif(cifId, remarks);
        return ResponseEntity.ok("CIF closed successfully");
    }

    @PreAuthorize("hasRole('MANAGER') or hasRole('ADMIN')")
    @PutMapping("/{cifId}/followup")
    public ResponseEntity<String> updateFollowup(
            @PathVariable String cifId,
            @RequestBody FollowupStatusRequest request) {
        customerService.updateFollowupStatus(cifId, request);
        return ResponseEntity.ok("Follow-up status updated");
    }

    @PreAuthorize("hasRole('MANAGER') or hasRole('ADMIN')")
    @GetMapping("/modifications/pending")
    public ResponseEntity<List<Map<String, Object>>> getPendingModifications() {
        return ResponseEntity.ok(customerService.getPendingModifications());
    }

    @PreAuthorize("hasRole('MANAGER') or hasRole('ADMIN')")
    @PutMapping("/modifications/{requestId}/review")
    public ResponseEntity<String> reviewModification(
            @PathVariable String requestId,
            @RequestBody ModificationReviewRequest request) throws Exception {
        customerService.reviewModification(requestId, request);
        return ResponseEntity.ok("Modification " + request.getAction() + "d successfully");
    }

    // ─── OFFICER MODIFY ENDPOINTS ─────────────────────────────────────────────

    @PreAuthorize("hasRole('OFFICER') or hasRole('MANAGER') or hasRole('ADMIN')")
    @PutMapping("/{cifId}/modify/basic-info")
    public ResponseEntity<String> modifyBasicInfo(
            @PathVariable String cifId,
            @RequestBody UpdateBasicInfoRequest request) {
        customerService.modifyBasicInfo(cifId, request);
        return ResponseEntity.ok("Basic info updated");
    }

    @PreAuthorize("hasRole('OFFICER') or hasRole('MANAGER') or hasRole('ADMIN')")
    @PutMapping("/{cifId}/modify/address")
    public ResponseEntity<String> modifyAddress(
            @PathVariable String cifId,
            @RequestBody AddressRequest request) {
        customerService.modifyAddress(cifId, request);
        return ResponseEntity.ok("Address updated");
    }

    @PreAuthorize("hasRole('OFFICER') or hasRole('MANAGER') or hasRole('ADMIN')")
    @PutMapping("/{cifId}/modify/kyc")
    public ResponseEntity<String> modifyKyc(
            @PathVariable String cifId,
            @RequestBody KycRequest request) {
        customerService.modifyKyc(cifId, request);
        return ResponseEntity.ok("KYC updated");
    }

    @PreAuthorize("hasRole('OFFICER') or hasRole('MANAGER') or hasRole('ADMIN')")
    @PutMapping("/{cifId}/modify/risk")
    public ResponseEntity<String> modifyRisk(
            @PathVariable String cifId,
            @RequestBody RiskRequest request) {
        customerService.modifyRisk(cifId, request);
        return ResponseEntity.ok("Risk updated");
    }

    @PreAuthorize("hasRole('OFFICER') or hasRole('MANAGER') or hasRole('ADMIN')")
    @PostMapping("/{cifId}/modifications")
    public ResponseEntity<String> submitModification(
            @PathVariable String cifId,
            @RequestBody Map<String, String> body) throws Exception {
        String requestId = customerService.submitModificationRequest(
                cifId,
                body.get("section"),
                body.get("oldData"),
                body.get("newData"),
                body.get("requestedBy")
        );
        return ResponseEntity.ok(requestId);
    }

    // ─── OPEN ENDPOINTS (no auth required) ───────────────────────────────────

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllCustomers() {
        return ResponseEntity.ok(customerService.getAllCustomers());
    }

    @GetMapping("/{cifId}")
    public ResponseEntity<Map<String, Object>> getCustomerDetails(@PathVariable String cifId) {
        return ResponseEntity.ok(customerService.getCustomerDetails(cifId));
    }

    @GetMapping("/dashboard-stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        return ResponseEntity.ok(customerService.getDashboardStats());
    }

    @GetMapping("/recent")
    public ResponseEntity<List<Map<String, Object>>> getRecentCustomers() {
        return ResponseEntity.ok(customerService.getRecentCustomers());
    }

    @GetMapping("/{cifId}/followup/auto-detect")
    public ResponseEntity<String> autoDetect(@PathVariable String cifId) {
        return ResponseEntity.ok(customerService.autoDetectFollowupStatus(cifId));
    }

    @GetMapping("/followup/master")
    public ResponseEntity<List<Map<String, Object>>> getFollowupMaster() {
        return ResponseEntity.ok(customerService.getFollowupStatusMaster());
    }

    @GetMapping("/{cifId}/modifications")
    public ResponseEntity<List<Map<String, Object>>> getModificationsByCif(@PathVariable String cifId) {
        return ResponseEntity.ok(customerService.getModificationsByCif(cifId));
    }

    // ─── CHAT ─────────────────────────────────────────────────────────────────

    @PostMapping("/chat")
    public ResponseEntity<Map<String, Object>> chat(@RequestBody Map<String, Object> body) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            List<Map<String, Object>> history = (List<Map<String, Object>>) body.get("history");
            List<Map<String, Object>> contents = new ArrayList<>();

            for (Map<String, Object> msg : history) {
                String role = msg.get("role").equals("assistant") ? "model" : "user";
                String text = (String) msg.get("content");
                contents.add(Map.of("role", role, "parts", List.of(Map.of("text", text))));
            }

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("contents", contents);
            requestBody.put("generationConfig", Map.of("temperature", 0.7, "maxOutputTokens", 2048));

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + geminiApiKey;

            System.out.println("[Chat] Calling Gemini...");
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

            List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.getBody().get("candidates");
            Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
            List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
            String replyText = parts.get(0).get("text").toString();

            return ResponseEntity.ok(Map.of("reply", replyText));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.ok(Map.of("reply", "AI assistant error. Please try again."));
        }
    }

    // ── ADD THESE TWO ENDPOINTS TO CustomerController.java ───────────────────────

    @PreAuthorize("hasRole('OFFICER') or hasRole('MANAGER') or hasRole('ADMIN')")
    @PutMapping("/{cifId}/nominee")
    public ResponseEntity<Map<String, String>> addNominee(
            @PathVariable String cifId,
            @RequestBody NomineeRequest request) {
        customerService.addNominee(cifId, request);
        return ResponseEntity.ok(Map.of("message", "Nominee details saved"));
    }

    @PreAuthorize("hasRole('OFFICER') or hasRole('MANAGER') or hasRole('ADMIN')")
    @PutMapping("/{cifId}/income")
    public ResponseEntity<Map<String, String>> addIncome(
            @PathVariable String cifId,
            @RequestBody IncomeRequest request) {
        customerService.addIncome(cifId, request);
        return ResponseEntity.ok(Map.of("message", "Income details saved"));
    }

}