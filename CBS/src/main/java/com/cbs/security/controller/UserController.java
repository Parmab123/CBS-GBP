package com.cbs.security.controller;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final EntityManager entityManager;

    // ── Get logged-in user's branch ───────────────────────────────────────────
    @GetMapping("/my-branch")
    public ResponseEntity<Map<String, Object>> getMyBranch(Authentication auth) {
        String username = auth.getName();

        List<Object[]> rows = entityManager.createNativeQuery("""
                        SELECT u.branch_id, b.branch_name, b.city, b.ifsc_code
                        FROM TB_USER_MASTER u
                        LEFT JOIN TB_BRANCH_MASTER b ON u.branch_id = b.branch_id
                        WHERE u.username = :username
                        """)
                .setParameter("username", username)
                .getResultList();

        if (rows.isEmpty())
            return ResponseEntity.ok(Map.of("branchId", "", "branchName", ""));

        Object[] r = rows.get(0);
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("branchId", r[0]);
        result.put("branchName", r[1]);
        result.put("city", r[2]);
        result.put("ifscCode", r[3]);
        return ResponseEntity.ok(result);
    }

    // ── Get all users (admin only) ────────────────────────────────────────────
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllUsers() {
        List<Object[]> rows = entityManager.createNativeQuery("""
                SELECT u.user_id, u.username, u.status, u.branch_id,
                       b.branch_name, r.role_name
                FROM TB_USER_MASTER u
                LEFT JOIN TB_BRANCH_MASTER b ON u.branch_id = b.branch_id
                LEFT JOIN TB_ROLE_MASTER   r ON u.role_id   = r.role_id
                ORDER BY u.username
                """).getResultList();

        List<Map<String, Object>> result = new java.util.ArrayList<>();
        for (Object[] r : rows) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("user_id", r[0]);
            map.put("username", r[1]);
            map.put("status", r[2]);
            map.put("branch_id", r[3]);
            map.put("branch_name", r[4]);
            map.put("role_name", r[5]);
            result.add(map);
        }
        return ResponseEntity.ok(result);
    }
}
