import axios from "axios";

// ── Base instance ─────────────────────────────────────────────────────────────
const api = axios.create({
    baseURL: "http://localhost:8080",      // 👈 change to your backend URL
    headers: {"Content-Type": "application/json"},
});

// ── Auto-attach JWT to every request ─────────────────────────────────────────
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// ── Auto-refresh token on 401 ─────────────────────────────────────────────────
api.interceptors.response.use(
    (res) => res,
    async (err) => {
        const original = err.config;
        if (err.response?.status === 401 && !original._retry) {
            original._retry = true;
            try {
                const refreshToken = localStorage.getItem("refreshToken");
                const res = await axios.post("http://localhost:8080/api/auth/refresh", {refreshToken});
                localStorage.setItem("accessToken", res.data.accessToken);
                original.headers.Authorization = `Bearer ${res.data.accessToken}`;
                return api(original);
            } catch {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                window.location.replace("/login");
            }
        }
        return Promise.reject(err);
    }
);

// ════════════════════════════════════════════════════════════════════════════════
// AUTH   →  /api/auth
// ════════════════════════════════════════════════════════════════════════════════

export const authApi = {
    // POST /api/auth/login
    login: (username, password) =>
        api.post("/api/auth/login", {username, password}),

    // POST /api/auth/refresh
    refresh: (refreshToken) =>
        api.post("/api/auth/refresh", {refreshToken}),
};

// ════════════════════════════════════════════════════════════════════════════════
// CUSTOMER   →  /api/customers
// ════════════════════════════════════════════════════════════════════════════════

export const customerApi = {

    // ── OFFICER ────────────────────────────────────────────────────────────────

    // POST   /api/customers/draft
    createDraft: (data) =>
        api.post("/api/customers/draft", data),

    // PUT    /api/customers/{cifId}/basic-info
    updateBasicInfo: (cifId, data) =>
        api.put(`/api/customers/${cifId}/basic-info`, data),

    // PUT    /api/customers/{cifId}/address
    addAddress: (cifId, data) =>
        api.put(`/api/customers/${cifId}/address`, data),

    // PUT    /api/customers/{cifId}/kyc
    addKyc: (cifId, data) =>
        api.put(`/api/customers/${cifId}/kyc`, data),

    // PUT    /api/customers/{cifId}/risk
    addRisk: (cifId, data) =>
        api.put(`/api/customers/${cifId}/risk`, data),

    // PUT    /api/customers/{cifId}/submit
    submitForReview: (cifId) =>
        api.put(`/api/customers/${cifId}/submit`),

    // PUT    /api/customers/{cifId}/signature
    saveSignature: (cifId, data) =>
        api.put(`/api/customers/${cifId}/signature`, data),

    // POST   /api/customers/{cifId}/modifications
    submitModification: (cifId, section, oldData, newData, requestedBy) =>
        api.post(`/api/customers/${cifId}/modifications`, {section, oldData, newData, requestedBy}),

    // PUT    /api/customers/{cifId}/modify/basic-info
    modifyBasicInfo: (cifId, data) =>
        api.put(`/api/customers/${cifId}/modify/basic-info`, data),

    // PUT    /api/customers/{cifId}/modify/address
    modifyAddress: (cifId, data) =>
        api.put(`/api/customers/${cifId}/modify/address`, data),

    // PUT    /api/customers/{cifId}/modify/kyc
    modifyKyc: (cifId, data) =>
        api.put(`/api/customers/${cifId}/modify/kyc`, data),

    // PUT    /api/customers/{cifId}/modify/risk   (OFFICER or MANAGER)
    modifyRisk: (cifId, data) =>
        api.put(`/api/customers/${cifId}/modify/risk`, data),

    // ── MANAGER ────────────────────────────────────────────────────────────────

    // PUT    /api/customers/{cifId}/approve
    approveCustomer: (cifId, data) =>
        api.put(`/api/customers/${cifId}/approve`, data),

    // PUT    /api/customers/{cifId}/status
    changeStatus: (cifId, data) =>
        api.put(`/api/customers/${cifId}/status`, data),

    // PUT    /api/customers/{cifId}/close
    closeCif: (cifId, remarks) =>
        api.put(`/api/customers/${cifId}/close`, {remarks}),

    // PUT    /api/customers/{cifId}/followup
    updateFollowup: (cifId, data) =>
        api.put(`/api/customers/${cifId}/followup`, data),

    // GET    /api/customers/pending-approvals
    getPendingApprovals: () =>
        api.get("/api/customers/pending-approvals"),

    // GET    /api/customers/modifications/pending
    getPendingModifications: () =>
        api.get("/api/customers/modifications/pending"),

    // PUT    /api/customers/modifications/{requestId}/review
    reviewModification: (requestId, data) =>
        api.put(`/api/customers/modifications/${requestId}/review`, data),

    // ── SHARED ─────────────────────────────────────────────────────────────────

    // GET    /api/customers
    getAllCustomers: () =>
        api.get("/api/customers"),

    // GET    /api/customers/{cifId}
    getCustomerDetails: (cifId) =>
        api.get(`/api/customers/${cifId}`),

    // GET    /api/customers/dashboard-stats
    getDashboardStats: () =>
        api.get("/api/customers/dashboard-stats"),

    // GET    /api/customers/recent
    getRecentCustomers: () =>
        api.get("/api/customers/recent"),

    // GET    /api/customers/followup/master
    getFollowupMaster: () =>
        api.get("/api/customers/followup/master"),

    // GET    /api/customers/{cifId}/followup/auto-detect
    autoDetectFollowup: (cifId) =>
        api.get(`/api/customers/${cifId}/followup/auto-detect`),

    // GET    /api/customers/{cifId}/modifications
    getModificationsByCif: (cifId) =>
        api.get(`/api/customers/${cifId}/modifications`),

    // POST   /api/customers/chat  (Gemini AI)
    chat: (history, context) =>
        api.post("/api/customers/chat", {history, context}),
};

export default api;