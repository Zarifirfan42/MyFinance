import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

type ToastVariant = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ToastCtx {
  showToast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastCtx | null>(null);

let idSeq = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const remove = useCallback((id: number) => {
    const t = timers.current.get(id);
    if (t) clearTimeout(t);
    timers.current.delete(id);
    setToasts((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, variant: ToastVariant = 'info') => {
      const id = ++idSeq;
      setToasts((prev) => [...prev, { id, message, variant }]);
      const tid = setTimeout(() => remove(id), 3000);
      timers.current.set(id, tid);
    },
    [remove],
  );

  useEffect(() => {
    return () => {
      timers.current.forEach((t) => clearTimeout(t));
    };
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="fixed bottom-20 right-4 z-[100] flex max-w-[min(100vw-2rem,20rem)] flex-col gap-2 md:bottom-6 md:right-6"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`rounded-lg border px-4 py-3 text-sm shadow-lg dark:border-slate-600 ${
              t.variant === 'error'
                ? 'border-red-200 bg-red-50 text-red-900 dark:bg-red-950/90 dark:text-red-100'
                : t.variant === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/90 dark:text-emerald-100'
                  : 'border-slate-200 bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100'
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
