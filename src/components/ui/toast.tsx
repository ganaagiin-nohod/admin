'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning';
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const handleToast = (event: CustomEvent) => {
      const { message, type = 'success' } = event.detail;
      const id = Date.now().toString();

      setToasts((prev) => [...prev, { id, message, type }]);

      // Auto remove after 3 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, 3000);
    };

    window.addEventListener('toast', handleToast as EventListener);
    return () =>
      window.removeEventListener('toast', handleToast as EventListener);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <>
      {children}
      <div className='fixed top-4 right-4 z-50 space-y-2'>
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex max-w-sm items-center gap-3 rounded-lg border px-4 py-3 shadow-lg ${
              toast.type === 'success'
                ? 'border-green-200 bg-green-50 text-green-800'
                : toast.type === 'error'
                  ? 'border-red-200 bg-red-50 text-red-800'
                  : 'border-yellow-200 bg-yellow-50 text-yellow-800'
            }`}
          >
            {toast.type === 'success' && (
              <CheckCircle size={20} className='text-green-600' />
            )}
            {toast.type === 'error' && (
              <XCircle size={20} className='text-red-600' />
            )}
            {toast.type === 'warning' && (
              <AlertCircle size={20} className='text-yellow-600' />
            )}

            <span className='flex-1 text-sm font-medium'>{toast.message}</span>

            <button
              onClick={() => removeToast(toast.id)}
              className='text-gray-400 hover:text-gray-600'
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

export function showToast(
  message: string,
  type: 'success' | 'error' | 'warning' = 'success'
) {
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('toast', {
      detail: { message, type }
    });
    window.dispatchEvent(event);
  }
}
