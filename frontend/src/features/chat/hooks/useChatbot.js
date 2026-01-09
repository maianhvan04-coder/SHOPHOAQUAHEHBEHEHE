import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { chatApi } from "~/api/chat.api";

function makeId() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function getErrorMessage(err) {
  const data = err?.response?.data;
  if (data?.error?.message) return data.error.message;
  if (data?.message) return data.message;
  return err?.message || "Có lỗi xảy ra, thử lại nhé.";
}

export function useChatbot(options = {}) {
  const {
    storageKey = "chat_session_id",
    initialMessages = [{ role: "bot", text: "Chào bạn 👋 Mình có thể hỗ trợ gì?" }],
    persist = true,              // ✅ có lưu sessionId không
    resetSessionOnReset = true,  // ✅ reset có tạo session mới không
  } = options;

  // ✅ giữ initialMessages ổn định
  const initialRef = useRef(initialMessages);

  // ✅ sessionId stable
  const sessionId = useMemo(() => {
    if (!persist) return makeId();

    const old = localStorage.getItem(storageKey);
    if (old) return old;

    const id = makeId();
    localStorage.setItem(storageKey, id);
    return id;
  }, [storageKey, persist]);

  const [messages, setMessages] = useState(initialRef.current);
  const [sending, setSending] = useState(false);

  // ✅ chặn double send chuẩn (không phụ thuộc sending state)
  const sendingRef = useRef(false);

  const listRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      const el = listRef.current;
      if (!el) return;
      el.scrollTop = el.scrollHeight;
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, scrollToBottom]);

  const appendUser = useCallback((text) => {
    setMessages((prev) => [...prev, { role: "user", text }]);
  }, []);

  const appendBot = useCallback((text) => {
    setMessages((prev) => [...prev, { role: "bot", text }]);
  }, []);

  const sendMessage = useCallback(
    async (text) => {
      const message = String(text || "").trim();
      if (!message) return null;
      if (sendingRef.current) return null;

      sendingRef.current = true;
      setSending(true);

      appendUser(message);

      try {
        const res = await chatApi({ message, sessionId });

        // ✅ đọc reply linh hoạt
        const reply =
          res?.data?.data?.reply ??
          res?.data?.reply ??
          "Mình chưa nhận được phản hồi, bạn thử lại nhé.";

        appendBot(reply);
        return reply;
      } catch (err) {
        const msg = getErrorMessage(err);
        appendBot(msg);
        return null;
      } finally {
        sendingRef.current = false;
        setSending(false);
      }
    },
    [appendBot, appendUser, sessionId]
  );

  const resetChat = useCallback(() => {
    setMessages(initialRef.current);

    if (resetSessionOnReset) {
      const id = makeId();
      if (persist) localStorage.setItem(storageKey, id);
    }
  }, [persist, resetSessionOnReset, storageKey]);

  return {
    sessionId,
    messages,
    sending,
    sendMessage,
    resetChat,
    listRef,
    scrollToBottom,
    appendUser,
    appendBot,
  };
}
