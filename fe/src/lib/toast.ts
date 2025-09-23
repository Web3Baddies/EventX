type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastOptions {
  id?: string;
  type?: ToastType;
  title?: string;
  message: string;
  durationMs?: number; // default 3500
}

export interface Toast extends Required<Omit<ToastOptions, 'id'>> { id: string }

const listeners = new Set<(toasts: Toast[]) => void>();
let toasts: Toast[] = [];

function notify() {
  for (const l of listeners) l(toasts);
}

export function subscribe(listener: (toasts: Toast[]) => void) {
  listeners.add(listener);
  listener(toasts);
  return () => listeners.delete(listener);
}

export function addToast(opts: ToastOptions) {
  const id = opts.id || Math.random().toString(36).slice(2);
  const toast: Toast = {
    id,
    type: opts.type || 'info',
    title: opts.title || '',
    message: opts.message,
    durationMs: opts.durationMs ?? 3500,
  };
  toasts = [toast, ...toasts];
  notify();
  // auto remove
  setTimeout(() => {
    removeToast(id);
  }, toast.durationMs);
}

export function removeToast(id: string) {
  const prevLen = toasts.length;
  toasts = toasts.filter(t => t.id !== id);
  if (toasts.length !== prevLen) notify();
}
