import { useEffect, useRef } from "react";
import { AlertTriangle, AlertCircle, Info } from "lucide-react";
import "./ConfirmDialog.css";

export type ConfirmDialogVariant = "danger" | "warning" | "info";

interface ConfirmDialogProps {
  isOpen: boolean;
  variant?: ConfirmDialogVariant;
  title: string;
  message: string;
  detail?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog = ({
  isOpen,
  variant = "danger",
  title,
  message,
  detail,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      cancelRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onCancel();
      if (e.key === "Enter") onConfirm();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onConfirm, onCancel]);

  if (!isOpen) return null;

  const iconMap = {
    danger: <AlertCircle size={20} />,
    warning: <AlertTriangle size={20} />,
    info: <Info size={20} />,
  };

  return (
    <div className="confirm-dialog-overlay" onClick={onCancel}>
      <div
        className={`confirm-dialog confirm-dialog--${variant}`}
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
      >
        {/* Icon */}
        <div className="confirm-dialog-icon">{iconMap[variant]}</div>

        {/* Title */}
        <h2 id="confirm-dialog-title" className="confirm-dialog-title">
          {title}
        </h2>

        {/* Message */}
        <p className="confirm-dialog-message">{message}</p>
        {detail && <p className="confirm-dialog-detail">{detail}</p>}

        {/* Actions */}
        <div className="confirm-dialog-actions">
          <button
            ref={cancelRef}
            className="confirm-dialog-btn confirm-dialog-btn--cancel"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            className={`confirm-dialog-btn confirm-dialog-btn--confirm confirm-dialog-btn--${variant}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
