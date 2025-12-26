import { createContext, useCallback, useContext, useMemo, useState } from "react";
import styles from "./Toast.module.scss";

const ToastCtx = createContext(null);
export const useToast = () => useContext(ToastCtx);

let idSeq = 0;

export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((t) => {
    const id = ++idSeq;
    const toast = {
      id,
      type: t.type || "info", // info | success | error | warn
      title: t.title || "",
      message: t.message || "",
      duration: t.duration ?? 3000,
    };

    setToasts((p) => [toast, ...p]);

    if (toast.duration > 0) {
      window.setTimeout(() => {
        setToasts((p) => p.filter((x) => x.id !== id));
      }, toast.duration);
    }
  }, []);

  const remove = useCallback((id) => {
    setToasts((p) => p.filter((x) => x.id !== id));
  }, []);

  const api = useMemo(
    () => ({
      push,
      success: (message, title = "Success") => push({ type: "success", title, message }),
      error: (message, title = "Error") => push({ type: "error", title, message, duration: 4000 }),
      info: (message, title = "Info") => push({ type: "info", title, message }),
      warn: (message, title = "Warning") => push({ type: "warn", title, message }),
      remove,
    }),
    [push, remove]
  );

  return (
    <ToastCtx.Provider value={api}>
      {children}

      <div className={styles.wrap}>
        {toasts.map((t) => (
          <div key={t.id} className={`${styles.toast} ${styles[t.type]}`}>
            <div className={styles.top}>
              <div className={styles.title}>{t.title}</div>
              <button className={styles.close} onClick={() => remove(t.id)}>✕</button>
            </div>
            {t.message && <div className={styles.msg}>{t.message}</div>}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
