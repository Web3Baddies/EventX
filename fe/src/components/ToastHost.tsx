'use client';

import { useEffect, useState } from 'react';
import { subscribe, removeToast, Toast } from '@/lib/toast';

export default function ToastHost() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    return subscribe(setToasts);
  }, []);

  return (
    <div className="fixed z-[1000] top-4 right-4 flex flex-col gap-2 w-[320px]">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`shadow-lg rounded-md p-3 border text-sm ${
            t.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
            t.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
            t.type === 'warning' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
            'bg-green-50 border-green-200 text-green-800'
          }`}
        >
          <div className="flex justify-between items-start gap-3">
            <div>
              {t.title && <div className="font-semibold mb-0.5">{t.title}</div>}
              <div className="leading-snug">{t.message}</div>
            </div>
            <button
              aria-label="Dismiss"
              onClick={() => removeToast(t.id)}
              className="text-current/80 hover:text-current"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
