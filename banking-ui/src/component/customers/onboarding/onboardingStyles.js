export const fieldStyle = (disabled) => ({
    width: "100%", padding: "7px 10px",
    background: disabled ? "rgba(255,255,255,.03)" : "#0e1117",
    border: "1px solid rgba(255,255,255,.1)",
    borderRadius: 5,
    color: disabled ? "#6b7a99" : "#e2e8f0",
    fontFamily: "'IBM Plex Sans', sans-serif",
    fontSize: ".8rem", outline: "none",
    transition: "border-color .2s",
    boxSizing: "border-box",
});

export const labelStyle = {
    fontSize: ".67rem", color: "#8a9bb5",
    fontWeight: 500, letterSpacing: ".03em",
    textTransform: "uppercase",
};

export const sectionTitle = {
    fontSize: ".67rem", fontWeight: 700, color: "#c8a96e",
    letterSpacing: ".08em", textTransform: "uppercase",
    paddingBottom: 6, marginBottom: 10,
    borderBottom: "1px solid rgba(200,169,110,.15)",
};

export const grid2 = {display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 16px"};
export const grid3 = {display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px 16px"};

export const btnPrimary = {
    padding: "8px 20px", borderRadius: 5, fontSize: ".8rem",
    fontWeight: 600, cursor: "pointer",
    fontFamily: "'IBM Plex Sans', sans-serif",
    background: "linear-gradient(135deg,#c8a96e,#a8894e)",
    border: "none", color: "#0e1117",
    display: "flex", alignItems: "center", gap: 6,
    transition: "opacity .2s",
};

export const btnSecondary = {
    padding: "8px 20px", borderRadius: 5, fontSize: ".8rem",
    fontWeight: 600, cursor: "pointer",
    fontFamily: "'IBM Plex Sans', sans-serif",
    background: "rgba(255,255,255,.05)",
    border: "1px solid rgba(255,255,255,.1)",
    color: "#8a9bb5",
    transition: "all .2s",
};

export const alert = (type) => ({
    padding: "8px 12px", borderRadius: 5,
    fontSize: ".78rem", marginBottom: 12,
    display: "flex", alignItems: "center", gap: 7,
    background: type === "error" ? "rgba(224,92,92,.1)" : "rgba(72,199,142,.1)",
    border: type === "error" ? "1px solid rgba(224,92,92,.3)" : "1px solid rgba(72,199,142,.3)",
    color: type === "error" ? "#e05c5c" : "#48c78e",
});