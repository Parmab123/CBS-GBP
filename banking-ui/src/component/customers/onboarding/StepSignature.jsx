// SignatureRequest: signatureData (base64), signatureType (DRAWN or UPLOADED)
import {useRef, useState} from "react";
import {alert, btnPrimary, btnSecondary, sectionTitle} from "./onboardingStyles";

export default function StepSignature({cifId, onSuccess, onBack}) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [signatureType, setType] = useState("DRAWN");
    const [signatureData, setData] = useState("");
    const [fileName, setFileName] = useState("");

    // Canvas drawing
    const canvasRef = useRef(null);
    const drawing = useRef(false);
    const lastPos = useRef({x: 0, y: 0});

    const getPos = (e, canvas) => {
        const rect = canvas.getBoundingClientRect();
        const src = e.touches ? e.touches[0] : e;
        return {x: src.clientX - rect.left, y: src.clientY - rect.top};
    };

    const startDraw = (e) => {
        drawing.current = true;
        lastPos.current = getPos(e, canvasRef.current);
    };

    const draw = (e) => {
        if (!drawing.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        const pos = getPos(e, canvas);
        ctx.beginPath();
        ctx.moveTo(lastPos.current.x, lastPos.current.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.strokeStyle = "#c8a96e";
        ctx.lineWidth = 2.5;
        ctx.lineCap = "round";
        ctx.stroke();
        lastPos.current = pos;
    };

    const endDraw = () => {
        drawing.current = false;
        setData(canvasRef.current.toDataURL("image/png"));
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
        setData("");
    };

    const handleUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setFileName(file.name);
        const reader = new FileReader();
        reader.onload = (ev) => setData(ev.target.result);
        reader.readAsDataURL(file);
    };

    const handle = async () => {
        if (!signatureData) return setError("Please draw or upload a signature.");
        setLoading(true);
        setError("");
        try {
            // Exact SignatureRequest fields
            const payload = {
                signatureData: signatureData,
                signatureType: signatureType, // "DRAWN" or "UPLOADED"
            };
            const res = await fetch(`http://localhost:8080/api/customers/${cifId}/signature`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + localStorage.getItem("accessToken")
                },
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error((await res.json()).message || "Failed");
            onSuccess({signatureData, signatureType});
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            {error && <div style={alert("error")}>⚠ {error}</div>}

            {/* Type Toggle */}
            <div style={{display: "flex", gap: 8, marginBottom: 16}}>
                {["DRAWN", "UPLOADED"].map(t => (
                    <button key={t} onClick={() => {
                        setType(t);
                        setData("");
                        clearCanvas && canvasRef.current && clearCanvas();
                    }}
                            style={{
                                padding: "6px 18px", borderRadius: 5, cursor: "pointer",
                                fontFamily: "'IBM Plex Sans', sans-serif", fontSize: ".78rem", fontWeight: 600,
                                background: signatureType === t ? "rgba(200,169,110,.2)" : "rgba(255,255,255,.04)",
                                border: signatureType === t ? "1px solid rgba(200,169,110,.5)" : "1px solid rgba(255,255,255,.1)",
                                color: signatureType === t ? "#c8a96e" : "#6b7a99",
                                transition: "all .2s",
                            }}>
                        {t === "DRAWN" ? "✍️ Draw" : "📁 Upload"}
                    </button>
                ))}
            </div>

            {signatureType === "DRAWN" && (
                <div>
                    <div style={{...sectionTitle}}>Draw Signature</div>
                    <div style={{
                        border: "1px solid rgba(200,169,110,.3)", borderRadius: 6,
                        background: "#0e1117", display: "inline-block", marginBottom: 8,
                    }}>
                        <canvas ref={canvasRef} width={500} height={150}
                                style={{display: "block", cursor: "crosshair", borderRadius: 6}}
                                onMouseDown={startDraw} onMouseMove={draw}
                                onMouseUp={endDraw} onMouseLeave={endDraw}
                                onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={endDraw}
                        />
                    </div>
                    <div>
                        <button onClick={clearCanvas}
                                style={{...btnSecondary, fontSize: ".73rem", padding: "5px 12px"}}>
                            🗑 Clear
                        </button>
                    </div>
                    {signatureData && (
                        <div style={{marginTop: 8, fontSize: ".72rem", color: "#48c78e"}}>
                            ✓ Signature captured
                        </div>
                    )}
                </div>
            )}

            {signatureType === "UPLOADED" && (
                <div>
                    <div style={sectionTitle}>Upload Signature Image</div>
                    <label style={{
                        display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer",
                        padding: "8px 16px", borderRadius: 5,
                        border: "1px dashed rgba(200,169,110,.4)",
                        background: "rgba(200,169,110,.05)", color: "#c8a96e",
                        fontSize: ".8rem", fontFamily: "'IBM Plex Sans', sans-serif",
                    }}>
                        📁 {fileName || "Choose image file (PNG/JPG)"}
                        <input type="file" accept="image/*" onChange={handleUpload} style={{display: "none"}}/>
                    </label>
                    {signatureData && (
                        <div style={{marginTop: 10}}>
                            <img src={signatureData} alt="signature preview"
                                 style={{maxHeight: 100, border: "1px solid rgba(255,255,255,.1)", borderRadius: 4}}/>
                        </div>
                    )}
                </div>
            )}

            <div style={{display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20}}>
                <button style={btnSecondary} onClick={onBack}>← Back</button>
                <button style={btnPrimary} onClick={handle} disabled={loading}>
                    {loading ? "Saving..." : "Save & Continue →"}
                </button>
            </div>
        </div>
    );
}