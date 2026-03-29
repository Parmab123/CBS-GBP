import {useEffect, useRef, useState} from "react";
import "./chatbot.css"

export default function Chatbot({
                                    context = `You are a CBS (Core Banking System) assistant ONLY for this application. 
You ONLY answer questions related to:
- CIF (Customer Information File) creation and onboarding
- KYC (Know Your Customer) process
- Customer approvals and rejections
- CIF status changes (Draft, Under Review, Approved, Rejected, Closed)
- Modifications and pending approvals
- Follow-up status management
- Signature management
- Risk profile
- User roles: Officer (maker), Manager (checker), Admin

If asked ANYTHING outside this CBS application (general knowledge, other topics, coding, weather, etc.), respond ONLY with:
"I can only assist with CBS banking operations. Please ask me about CIF onboarding, KYC, approvals, or other CBS features."

Be concise and professional. Never answer outside the scope of this CBS application.`,
                                }) {
    const token = localStorage.getItem("accessToken") || localStorage.getItem("token") || "";

    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([
        {role: "assistant", content: "Hi! I'm your CBS Assistant. How can I help you today?"},
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const endRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({behavior: "smooth"});
    }, [messages, loading]);

    useEffect(() => {
        if (open) setTimeout(() => inputRef.current?.focus(), 120);
    }, [open]);

    const sendMessage = async () => {
        const text = input.trim();
        if (!text || loading) return;

        const userMsg = {role: "user", content: text};
        const updated = [...messages, userMsg];
        setMessages(updated);
        setInput("");
        setLoading(true);

        try {
            const res = await fetch("http://localhost:8080/api/customers/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + token,
                },
                body: JSON.stringify({history: updated, context}),
            });
            const data = await res.json();
            setMessages([...updated, {
                role: "assistant",
                content: data.reply || "Sorry, I couldn't get a response.",
            }]);
        } catch {
            setMessages([...updated, {
                role: "assistant",
                content: "Connection error. Please try again.",
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKey = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const clearChat = () =>
        setMessages([{role: "assistant", content: "Hi! I'm your CBS Assistant. How can I help you today?"}]);

    const SUGGESTIONS = ["How to create a CIF?", "Pending approvals process", "KYC requirements", "CIF status types"];

    return (
        <>
            {/*      <style>{`*/}
            {/*  */}
            {/*`}</style>*/}

            {/* ── CHAT WINDOW ── */}
            {open && (
                <div className="cb-window">

                    {/* Header */}
                    <div className="cb-head">
                        <div className="cb-hav">AI</div>
                        <div>
                            <div className="cb-hname">CBS Assistant</div>
                            <div className="cb-hstatus">Online</div>
                        </div>
                        <div className="cb-hbtns">
                            <button className="cb-hbtn" onClick={clearChat} title="Clear chat">
                                <svg viewBox="0 0 24 24">
                                    <polyline points="1 4 1 10 7 10"/>
                                    <path d="M3.51 15a9 9 0 1 0 .49-4.95"/>
                                </svg>
                            </button>
                            <button className="cb-hbtn" onClick={() => setOpen(false)} title="Close">
                                <svg viewBox="0 0 24 24">
                                    <line x1="18" y1="6" x2="6" y2="18"/>
                                    <line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="cb-msgs">
                        {messages.map((msg, i) => (
                            <div key={i} className={"cb-msg " + msg.role}>
                                <div className="cb-mav">{msg.role === "assistant" ? "AI" : "ME"}</div>
                                <div className="cb-bbl">{msg.content}</div>
                            </div>
                        ))}
                        {loading && (
                            <div className="cb-msg assistant">
                                <div className="cb-mav">AI</div>
                                <div className="cb-typing"><span/><span/><span/></div>
                            </div>
                        )}
                        <div ref={endRef}/>
                    </div>

                    {/* Quick suggestions — only on fresh chat */}
                    {messages.length <= 1 && (
                        <div className="cb-suggestions">
                            {SUGGESTIONS.map((s) => (
                                <button key={s} className="cb-chip"
                                        onClick={() => {
                                            setInput(s);
                                            inputRef.current?.focus();
                                        }}>
                                    {s}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input */}
                    <div className="cb-inputrow">
            <textarea
                ref={inputRef}
                className="cb-ta"
                rows={1}
                placeholder="Ask me anything..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
            />
                        <button
                            className="cb-sendbtn"
                            onClick={sendMessage}
                            disabled={!input.trim() || loading}
                        >
                            <svg viewBox="0 0 24 24">
                                <line x1="22" y1="2" x2="11" y2="13"/>
                                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                            </svg>
                        </button>
                    </div>

                </div>
            )}

            {/* ── FAB BUTTON ── */}
            <button className="cb-fab" onClick={() => setOpen((v) => !v)}>
                {open ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="#0a1628" strokeWidth="2.5">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="#0a1628" strokeWidth="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                )}
                {!open && <div className="cb-fab-dot"/>}
            </button>
        </>
    );
}