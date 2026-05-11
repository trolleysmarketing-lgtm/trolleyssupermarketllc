// components/Chatbot.tsx
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useLocale } from "next-intl";

type Button = {
  text: string;
  action: string;
  url?: string;
};

type Message = {
  text: string;
  isUser: boolean;
  timestamp: number;
  id: string;
};

// Brand Colors - Trolleys
const BRAND = {
  blue: "#1C75BC",
  red: "#DB2B2C",
  white: "#FFFFFF",
  darkBlue: "#155a8e",
  darkRed: "#c42021",
  lightBlue: "#e8f4fd",
  lightRed: "#fef2f2",
};

// Generate unique ID for messages
const generateId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export default function Chatbot() {
  const locale = useLocale();
  const isAr = locale === "ar";
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      text: isAr
        ? "مرحباً! كيف يمكنني مساعدتك اليوم؟"
        : "Hello! How may I assist you today?",
      isUser: false,
      timestamp: Date.now(),
      id: generateId(),
    },
  ]);
  const [buttons, setButtons] = useState<Button[]>([
    { text: isAr ? "المتاجر" : "Stores", action: "branches" },
    { text: isAr ? "العروض" : "Offers", action: "offers" },
    { text: isAr ? "التوصيل" : "Delivery", action: "delivery" },
    { text: isAr ? "المساعدة" : "Help", action: "help" },
  ]);
  const [input, setInput] = useState("");
  const [isWaiting, setIsWaiting] = useState(false);
  const [unread, setUnread] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryMessage, setRetryMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input and mark as read when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
      setUnread(false);
      setError(null);
    } else {
      toggleButtonRef.current?.focus();
    }
  }, [isOpen]);

  // Close chat on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  // Trap focus inside chat window when open
  useEffect(() => {
    if (!isOpen) return;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !chatWindowRef.current) return;

      const focusableElements = chatWindowRef.current.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements.length === 0) return;

      const firstFocusable = focusableElements[0] as HTMLElement;
      const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable?.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable?.focus();
        }
      }
    };

    document.addEventListener("keydown", handleTabKey);
    return () => document.removeEventListener("keydown", handleTabKey);
  }, [isOpen]);

  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim() || isWaiting) return;
    
    const userMessage: Message = {
      text: message.trim(),
      isUser: true,
      timestamp: Date.now(),
      id: generateId(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsWaiting(true);
    setButtons([]);
    setError(null);
    setRetryMessage(message.trim());

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept-Language": locale,
        },
        body: JSON.stringify({ 
          message: message.trim(), 
          lang: locale,
          timestamp: Date.now(),
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      
      if (data.reply) {
        setMessages((prev) => [
          ...prev,
          { 
            text: data.reply, 
            isUser: false, 
            timestamp: Date.now(),
            id: generateId(),
          },
        ]);
      }
      
      if (data.buttons && Array.isArray(data.buttons)) {
        setButtons(data.buttons);
      }
    } catch (err) {
      console.error("Chatbot error:", err);
      
      if (err instanceof DOMException && err.name === "AbortError") {
        setError(isAr 
          ? "انتهت مهلة الطلب، يرجى المحاولة مرة أخرى." 
          : "Request timed out, please try again."
        );
      } else {
        setError(isAr 
          ? "حدث خطأ، يرجى المحاولة مرة أخرى." 
          : "An error occurred, please try again."
        );
      }
      
      setButtons([
        { text: isAr ? "🔄 حاول مرة أخرى" : "🔄 Try Again", action: "retry" },
        { text: isAr ? "💬 مساعدة" : "💬 Help", action: "help" },
      ]);
    } finally {
      setIsWaiting(false);
    }
  }, [isWaiting, locale, isAr]);

  const handleButton = useCallback((btn: Button) => {
    if (btn.action === "url" && btn.url) {
      window.open(btn.url, "_blank", "noopener,noreferrer");
    } else if (btn.action === "retry" && retryMessage) {
      setMessages(prev => prev.slice(0, -1));
      sendMessage(retryMessage);
    } else {
      sendMessage(btn.action);
    }
  }, [retryMessage, sendMessage]);

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString(
      locale === "ar" ? "ar-AE" : "en-AE", 
      { hour: "2-digit", minute: "2-digit" }
    );
  };

  return (
    <>
      <style jsx global>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseSubtle {
          0%, 100% { 
            transform: scale(1); 
            box-shadow: 0 4px 12px rgba(28, 117, 188, 0.2); 
          }
          50% { 
            transform: scale(1.02); 
            box-shadow: 0 6px 16px rgba(28, 117, 188, 0.3); 
          }
        }
        @keyframes typingDot {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        .chatbot-fade-in { 
          animation: fadeInUp 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards; 
        }
        .typing-dot { 
          animation: typingDot 1.2s infinite ease-in-out; 
        }
        .message-animation {
          animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        
        .chatbot-scroll {
          scroll-behavior: smooth;
          overscroll-behavior: contain;
        }
        .chatbot-scroll::-webkit-scrollbar { width: 4px; }
        .chatbot-scroll::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
        .chatbot-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .chatbot-scroll::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        
        .quick-btn:focus-visible {
          outline: 2px solid ${BRAND.blue};
          outline-offset: 2px;
        }
        
        @media (prefers-reduced-motion: reduce) {
          .chatbot-fade-in,
          .message-animation,
          .quick-btn {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>

      <div
        role="complementary"
        aria-label={isAr ? "نافذة الدردشة" : "Chat window"}
        style={{
          position: "fixed",
          bottom: "24px",
          right: isAr ? "auto" : "24px",
          left: isAr ? "24px" : "auto",
          zIndex: 9999,
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif",
        }}
      >
        {/* Chat Window */}
        {isOpen && (
          <div
            ref={chatWindowRef}
            className="chatbot-fade-in"
            role="dialog"
            aria-modal="true"
            aria-label={isAr ? "دردشة دعم تروليز" : "Trolleys Support Chat"}
            style={{
              position: "absolute",
              bottom: "80px",
              right: isAr ? "auto" : "0",
              left: isAr ? "0" : "auto",
              width: "380px",
              maxWidth: "calc(100vw - 32px)",
              height: "520px",
              maxHeight: "calc(100vh - 120px)",
              background: BRAND.white,
              borderRadius: "16px",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.06)",
              border: "1px solid #e9ecef",
              direction: isAr ? "rtl" : "ltr",
            }}
          >
            {/* Header */}
            <header
              style={{
                background: `linear-gradient(135deg, ${BRAND.blue} 0%, ${BRAND.darkBlue} 100%)`,
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexShrink: 0,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  aria-hidden="true"
                  style={{
                    width: "36px",
                    height: "36px",
                    background: "rgba(255, 255, 255, 0.15)",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "18px",
                  }}
                >
                  🛒
                </div>
                <div>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "14px",
                      fontWeight: 600,
                      color: BRAND.white,
                      letterSpacing: "0.3px",
                    }}
                  >
                    {isAr ? "دعم تروليز" : "Trolleys Support"}
                  </h3>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
                    <div 
                      aria-hidden="true"
                      style={{ 
                        width: "6px", 
                        height: "6px", 
                        background: "#10b981", 
                        borderRadius: "50%",
                        boxShadow: "0 0 6px rgba(16, 185, 129, 0.5)",
                      }} 
                    />
                    <span style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.8)" }}>
                      {isAr ? "متصل" : "Online"}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                aria-label={isAr ? "إغلاق الدردشة" : "Close chat"}
                style={{
                  width: "28px",
                  height: "28px",
                  background: "rgba(255, 255, 255, 0.15)",
                  border: "none",
                  borderRadius: "8px",
                  color: BRAND.white,
                  fontSize: "14px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = BRAND.red;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
                }}
              >
                <span aria-hidden="true">✕</span>
              </button>
            </header>

            {/* Messages */}
            <div
              className="chatbot-scroll"
              role="log"
              aria-live="polite"
              aria-relevant="additions"
              aria-label={isAr ? "رسائل الدردشة" : "Chat messages"}
              style={{
                flex: 1,
                padding: "20px",
                overflowY: "auto",
                background: "#fafbfc",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              {messages.map((msg, idx) => (
                <div
                  key={msg.id || idx}
                  className="message-animation"
                  style={{
                    display: "flex",
                    justifyContent: msg.isUser ? "flex-end" : "flex-start",
                  }}
                >
                  {!msg.isUser && (
                    <div
                      aria-hidden="true"
                      style={{
                        width: "28px",
                        height: "28px",
                        background: BRAND.blue,
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "14px",
                        marginRight: isAr ? "0" : "10px",
                        marginLeft: isAr ? "10px" : "0",
                        flexShrink: 0,
                      }}
                    >
                      🛒
                    </div>
                  )}
                  <div style={{ maxWidth: msg.isUser ? "75%" : "85%" }}>
                    <div
                      role="article"
                      aria-label={`${msg.isUser ? (isAr ? "أنت" : "You") : "Trolleys"} - ${formatTime(msg.timestamp)}`}
                      style={{
                        padding: "10px 14px",
                        borderRadius: msg.isUser ? "12px 4px 12px 12px" : "4px 12px 12px 12px",
                        fontSize: "13px",
                        lineHeight: "1.6",
                        background: msg.isUser ? BRAND.blue : BRAND.white,
                        color: msg.isUser ? BRAND.white : "#2c3e50",
                        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                        border: msg.isUser ? "none" : "1px solid #e9ecef",
                        wordBreak: "break-word",
                        whiteSpace: "pre-line", // ← ALT ALTA GÖRÜNME İÇİN EKLENDİ
                      }}
                    >
                      {msg.text}
                    </div>
                    <time
                      dateTime={new Date(msg.timestamp).toISOString()}
                      style={{
                        fontSize: "10px",
                        color: "#94a3b8",
                        display: "block",
                        marginTop: "4px",
                        textAlign: msg.isUser ? "right" : "left",
                      }}
                    >
                      {formatTime(msg.timestamp)}
                    </time>
                  </div>
                </div>
              ))}

              {isWaiting && (
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div
                    aria-hidden="true"
                    style={{
                      width: "28px",
                      height: "28px",
                      background: BRAND.blue,
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "14px",
                    }}
                  >
                    🛒
                  </div>
                  <div
                    role="status"
                    aria-label={isAr ? "تروليز يكتب..." : "Trolleys is typing..."}
                    style={{
                      background: BRAND.white,
                      padding: "12px 16px",
                      borderRadius: "4px 12px 12px 12px",
                      display: "flex",
                      gap: "4px",
                      border: "1px solid #e9ecef",
                    }}
                  >
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="typing-dot"
                        style={{
                          width: "6px",
                          height: "6px",
                          background: "#94a3b8",
                          borderRadius: "50%",
                          animationDelay: `${i * 0.2}s`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div
                  role="alert"
                  style={{
                    background: BRAND.lightRed,
                    border: `1px solid ${BRAND.red}20`,
                    borderRadius: "12px",
                    padding: "12px 16px",
                    fontSize: "12px",
                    color: BRAND.darkRed,
                    textAlign: "center",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    justifyContent: "center",
                  }}
                >
                  <span aria-hidden="true">⚠️</span>
                  {error}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Buttons */}
            {buttons.length > 0 && !isWaiting && (
              <nav
                aria-label={isAr ? "خيارات سريعة" : "Quick options"}
                style={{
                  padding: "12px 16px",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px",
                  borderTop: "1px solid #e9ecef",
                  background: BRAND.white,
                  flexShrink: 0,
                }}
              >
                {buttons.map((btn, idx) => (
                  <button
                    key={idx}
                    className="quick-btn"
                    onClick={() => handleButton(btn)}
                    aria-label={btn.text}
                    style={{
                      background: "transparent",
                      border: `1px solid #e2e8f0`,
                      padding: "6px 14px",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: 500,
                      cursor: "pointer",
                      color: BRAND.blue,
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = BRAND.blue;
                      e.currentTarget.style.borderColor = BRAND.blue;
                      e.currentTarget.style.color = BRAND.white;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.borderColor = "#e2e8f0";
                      e.currentTarget.style.color = BRAND.blue;
                    }}
                  >
                    {btn.text}
                  </button>
                ))}
              </nav>
            )}

            {/* Input Area */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage(input);
              }}
              style={{
                padding: "16px",
                background: BRAND.white,
                borderTop: "1px solid #e9ecef",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  background: "#f8f9fa",
                  borderRadius: "12px",
                  padding: "4px 4px 4px 16px",
                  border: `1px solid #e9ecef`,
                  transition: "border-color 0.2s",
                }}
              >
                <label 
                  htmlFor="chatbot-message-input" 
                  style={{
                    position: "absolute",
                    width: "1px",
                    height: "1px",
                    padding: "0",
                    margin: "-1px",
                    overflow: "hidden",
                    clip: "rect(0, 0, 0, 0)",
                    whiteSpace: "nowrap",
                    borderWidth: "0",
                  }}
                >
                  {isAr ? "اكتب رسالتك" : "Type your message"}
                </label>
                <input
                  ref={inputRef}
                  id="chatbot-message-input"
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={isAr ? "اكتب رسالتك..." : "Type your message..."}
                  disabled={isWaiting}
                  autoComplete="off"
                  spellCheck={false}
                  maxLength={500}
                  style={{
                    flex: 1,
                    border: "none",
                    background: "transparent",
                    padding: "10px 0",
                    fontSize: "13px",
                    outline: "none",
                    fontFamily: "inherit",
                    direction: isAr ? "rtl" : "ltr",
                    color: "#2c3e50",
                  }}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isWaiting}
                  aria-label={isAr ? "إرسال رسالة" : "Send message"}
                  style={{
                    width: "36px",
                    height: "36px",
                    background: input.trim() && !isWaiting ? BRAND.blue : "#cbd5e1",
                    border: "none",
                    borderRadius: "10px",
                    cursor: input.trim() && !isWaiting ? "pointer" : "not-allowed",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    if (input.trim() && !isWaiting) {
                      e.currentTarget.style.background = BRAND.darkBlue;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (input.trim() && !isWaiting) {
                      e.currentTarget.style.background = BRAND.blue;
                    }
                  }}
                >
                  <svg 
                    aria-hidden="true"
                    width="14" 
                    height="14" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke={BRAND.white} 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Toggle Button */}
        <button
          ref={toggleButtonRef}
          onClick={() => setIsOpen(!isOpen)}
          aria-label={
            isOpen 
              ? (isAr ? "إغلاق الدردشة" : "Close chat") 
              : (isAr ? "فتح الدردشة" : "Open chat")
          }
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          style={{
            width: "56px",
            height: "56px",
            background: isOpen ? BRAND.red : BRAND.blue,
            border: "none",
            borderRadius: "16px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: isOpen 
              ? "0 4px 12px rgba(219, 43, 44, 0.3)" 
              : "0 4px 12px rgba(28, 117, 188, 0.3)",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            position: "relative",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.05)";
            e.currentTarget.style.boxShadow = isOpen 
              ? "0 6px 16px rgba(219, 43, 44, 0.4)" 
              : "0 6px 16px rgba(28, 117, 188, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = isOpen 
              ? "0 4px 12px rgba(219, 43, 44, 0.3)" 
              : "0 4px 12px rgba(28, 117, 188, 0.3)";
          }}
        >
          {isOpen ? (
            <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={BRAND.white} strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={BRAND.white} strokeWidth="1.5">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              <path d="M8 10h.01" />
              <path d="M12 10h.01" />
              <path d="M16 10h.01" />
            </svg>
          )}
        </button>

        {/* Notification Badge */}
        {unread && !isOpen && (
          <div
            style={{
              position: "absolute",
              top: "-4px",
              right: "-4px",
              width: "20px",
              height: "20px",
              background: BRAND.red,
              borderRadius: "50%",
              border: `2px solid ${BRAND.white}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "10px",
              fontWeight: "bold",
              color: BRAND.white,
              animation: "pulseSubtle 2s infinite",
            }}
            role="status"
            aria-label={isAr ? "رسالة غير مقروءة" : "Unread message"}
          >
            1
          </div>
        )}
      </div>
    </>
  );
}