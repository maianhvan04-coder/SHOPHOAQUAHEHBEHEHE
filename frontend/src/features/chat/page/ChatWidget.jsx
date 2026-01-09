import { useEffect, useMemo, useRef, useState } from "react";
import { useChatbot } from "~/features/chat/hooks/useChatbot";

const QUICK = [
  { icon: "🚚", label: "Giao hàng", text: "Chính sách giao hàng thế nào?" },
  { icon: "🔁", label: "Đổi trả", text: "Chính sách đổi/trả ra sao?" },
  { icon: "💰", label: "Giá sản phẩm", text: "Báo giá giúp mình với" },
  { icon: "📍", label: "Địa chỉ", text: "Shop ở đâu vậy?" },
];

function TypingDots() {
  return (
    <div className="flex items-center gap-1">
      <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.2s]" />
      <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.1s]" />
      <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" />
    </div>
  );
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");

  const textareaRef = useRef(null);

  const { messages, sending, sendMessage, listRef, resetChat } = useChatbot({
    initialMessages: [
      { role: "bot", text: "Chào bạn 👋 Joygreen có thể hỗ trợ gì cho bạn?" },
    ],
  });

  const showQuick = useMemo(() => messages.length <= 1, [messages.length]);

  // focus when open
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => textareaRef.current?.focus?.(), 80);
    return () => clearTimeout(t);
  }, [open]);

  // auto scroll
  useEffect(() => {
    if (!open) return;
    requestAnimationFrame(() => {
      const el = listRef.current;
      if (!el) return;
      el.scrollTop = el.scrollHeight;
    });
  }, [open, messages.length, sending, listRef]);

  // auto resize textarea (max 3 lines)
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "0px";
    const next = Math.min(el.scrollHeight, 92);
    el.style.height = `${next}px`;
  }, [input]);

  const onSend = async (raw) => {
    const text = String(raw ?? input).trim();
    if (!text || sending) return;
    setInput("");
    await sendMessage(text);
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <>
      {/* Launcher */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 right-5 z-[9999] h-14 w-14 rounded-full shadow-2xl
                   flex items-center justify-center active:scale-95 transition
                   bg-emerald-600 hover:bg-emerald-700 text-white"
        aria-label="Open chatbot"
        title="Chat hỗ trợ Joygreen"
      >
        <span className="text-xl">{open ? "×" : "🍃"}</span>
        <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-emerald-400 ring-4 ring-white" />
      </button>

      {/* Panel */}
      <div
        className={[
          "fixed z-[9999] right-5 bottom-24",
          "w-[360px] sm:w-[400px] max-w-[calc(100vw-2.5rem)]",
          "h-[560px] max-h-[calc(100vh-9rem)]",
          "transition-all duration-200",
          open
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-3 pointer-events-none",
        ].join(" ")}
      >
        {/* Card (fixed layout + không phình) */}
        <div className="h-full rounded-2xl border border-slate-200 shadow-2xl overflow-hidden bg-white/95 backdrop-blur flex flex-col">
          {/* Header */}
          <div className="shrink-0 px-4 py-3 bg-emerald-700 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center ring-1 ring-white/15">
                  <span className="text-lg">👩‍💼</span>
                </div>
                <div className="leading-tight">
                  <div className="font-semibold text-sm">Joygreen Support</div>
                  <div className="text-xs opacity-90 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-emerald-300" />
                      Online
                    </span>
                    <span className="opacity-60">•</span>
                    <span className="opacity-90">Tư vấn nhanh</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={resetChat}
                  className="h-9 px-3 rounded-xl hover:bg-white/10 text-xs"
                  title="Làm mới đoạn chat"
                >
                  Reset
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="h-9 w-9 rounded-xl hover:bg-white/10"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>

          {/* Quick replies */}
          {showQuick && (
            <div className="shrink-0 bg-white px-3 pt-3 pb-2 border-b border-slate-200">
              <div className="flex flex-wrap gap-2">
                {QUICK.map((q) => (
                  <button
                    key={q.label}
                    type="button"
                    disabled={sending}
                    onClick={() => onSend(q.text)}
                    className="inline-flex items-center gap-2 text-xs px-3 py-2 rounded-full
                               bg-white border border-slate-200 hover:bg-slate-100 hover:border-slate-300
                               disabled:opacity-60 disabled:cursor-not-allowed transition"
                  >
                    <span className="text-base leading-none">{q.icon}</span>
                    <span className="whitespace-nowrap">{q.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages (scroll riêng) */}
          <div className="flex-1 bg-slate-50 overflow-hidden">
            <div
              ref={listRef}
              className="h-full overflow-auto px-3 py-3"
            >
              {messages.map((m, idx) => {
                const isUser = m.role === "user";
                return (
                  <div
                    key={idx}
                    className={`my-2 flex items-end gap-2 ${
                      isUser ? "justify-end" : "justify-start"
                    }`}
                  >
                    {!isUser && (
                      <div className="h-7 w-7 shrink-0 rounded-full bg-emerald-700/10 flex items-center justify-center">
                        <span className="text-sm">👩‍💼</span>
                      </div>
                    )}

                    <div className="max-w-[82%]">
                      <div
                        className={[
                          "inline-block px-3 py-2 text-sm leading-relaxed border shadow-sm break-words",
                          isUser
                            ? "bg-emerald-600 text-white border-emerald-600 rounded-2xl rounded-br-md"
                            : "bg-white text-slate-900 border-slate-200 rounded-2xl rounded-bl-md",
                        ].join(" ")}
                        style={{ whiteSpace: "pre-wrap" }}
                      >
                        {m.text}
                      </div>
                    </div>
                  </div>
                );
              })}

              {sending && (
                <div className="my-2 flex items-end gap-2 justify-start">
                  <div className="h-7 w-7 shrink-0 rounded-full bg-emerald-700/10 flex items-center justify-center">
                    <span className="text-sm">👩‍💼</span>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-md px-3 py-2 shadow-sm">
                    <TypingDots />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Input (pill + không lệch) */}
          <div className="shrink-0 bg-white border-t border-slate-200 px-3 py-3">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm px-2 py-2 flex items-end gap-2
                            focus-within:ring-2 focus-within:ring-emerald-200 focus-within:border-emerald-200">
              <textarea
                ref={textareaRef}
                id="chat_input_box"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Nhập tin nhắn…"
                className="flex-1 resize-none bg-transparent px-3 py-2 text-sm outline-none
                           placeholder:text-slate-400"
                rows={1}
              />

              <button
                onClick={() => onSend()}
                disabled={sending || !input.trim()}
                className={[
                  "h-10 w-10 rounded-xl flex items-center justify-center shrink-0",
                  "text-white shadow-sm transition active:scale-95",
                  sending || !input.trim()
                    ? "bg-emerald-300 cursor-not-allowed"
                    : "bg-emerald-600 hover:bg-emerald-700",
                ].join(" ")}
                aria-label="Gửi"
                title="Gửi"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 2 11 13" />
                  <path d="M22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>

            <div className="mt-2 text-[11px] text-slate-400">
              Enter để gửi • Shift+Enter xuống dòng
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
