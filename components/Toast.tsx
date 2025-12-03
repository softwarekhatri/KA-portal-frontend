import React from "react";

export type ToastType = "success" | "error" | "info";

export interface ToastProps {
  message: string;
  type?: ToastType;
  onClose?: () => void;
}

const toastColors: Record<ToastType, string> = {
  success: "bg-green-100 text-green-800 border-green-300",
  error: "bg-red-100 text-red-800 border-red-300",
  info: "bg-blue-100 text-blue-800 border-blue-300",
};

const Toast: React.FC<ToastProps> = ({ message, type = "info", onClose }) => {
  return (
    <div
      className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded shadow border ${toastColors[type]} flex items-center gap-2 animate-fade-in`}
      role="alert"
    >
      <span>{message}</span>
      {onClose && (
        <button
          className="ml-4 text-lg font-bold opacity-60 hover:opacity-100"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default Toast;
