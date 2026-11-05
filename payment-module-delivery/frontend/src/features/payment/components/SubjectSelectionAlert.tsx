// ─── Subject Selection Alert Component (XD Screen 8) ───────────────────────────
// Displays a visible XD-style validation alert when subject selection
// is required but missing or invalid. Shows inline above the form area.
import React from "react";
import { AlertTriangle, X } from "lucide-react";

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
    <div className="pm-validation-alert" role="alert" aria-live="polite">
      <div className="pm-validation-alert__icon">
        <AlertTriangle className="w-5 h-5" />
      </div>
      <div className="pm-validation-alert__content">
        <span className="pm-validation-alert__title">Validation Required</span>
        <span className="pm-validation-alert__message">{message}</span>
      </div>
      {onDismiss && (
        <button
          type="button"
          className="pm-validation-alert__close"
          onClick={onDismiss}
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
