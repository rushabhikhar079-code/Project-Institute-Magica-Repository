import React from "react";
import { ArrowRight, Info, X } from "lucide-react";

interface SubjectSelectionAlertProps {
  visible: boolean;
  message: string;
  onDismiss?: () => void;
}

export const SubjectSelectionAlert: React.FC<SubjectSelectionAlertProps> = ({
  visible,
  message,
  onDismiss,
}) => {
  if (!visible) return null;

  return (
    <div className="pm-validation-overlay" role="alertdialog" aria-modal="true" aria-label="Validation message">
      <div className="pm-validation-dialog">
        <button type="button" className="pm-validation-dialog__close" onClick={onDismiss} aria-label="Close">
          <X />
        </button>
        <div className="pm-validation-dialog__icon"><Info /></div>
        <div className="pm-validation-dialog__content">
          <strong>institutemagica.com says</strong>
          <span>{message}</span>
        </div>
        <button type="button" className="pm-btn pm-btn--primary pm-validation-dialog__ok" onClick={onDismiss}>
          Ok <ArrowRight />
        </button>
      </div>
    </div>
  );
};
