import React, { useRef, useId } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useDialog } from '../../hooks/useDialog';

/**
 * Modal — Unified, accessible dialog container primitive.
 *
 * Implements WAI-ARIA Dialog (Modal) pattern:
 * - role="dialog" or "alertdialog"
 * - aria-modal="true"
 * - aria-labelledby & aria-describedby
 * - Complete focus trap (Tab / Shift+Tab cycling)
 * - Automatic focus restoration to trigger element
 * - Escape key to close
 * - Safe body scroll lock with reference counting
 * - Backdrop click to close (checked on mousedown)
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  icon: Icon,
  iconColor = 'text-accent',
  iconBg = 'bg-accent/10 border-accent/20',
  maxWidth = 'max-w-md',
  role = 'dialog',
  closeOnBackdrop = true,
  closeOnEscape = true,
  showCloseButton = true,
  initialFocusRef,
  headerRight,
  footer,
  className = '',
  bodyClassName = '',
  children,
}) => {
  const dialogRef = useRef(null);
  const autoId = useId();
  const titleId = `dialog-title-${autoId}`;
  const descId = `dialog-desc-${autoId}`;

  useDialog({
    isOpen,
    onClose,
    dialogRef,
    initialFocusRef,
    closeOnEscape,
  });

  if (!isOpen) return null;

  const content = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 animate-fade-in"
      onMouseDown={(e) => {
        if (closeOnBackdrop && e.target === e.currentTarget) {
          onClose?.();
        }
      }}
    >
      <div
        ref={dialogRef}
        role={role}
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        data-lenis-prevent
        className={`relative w-full ${maxWidth} bg-surface border border-line rounded-xl shadow-modal my-auto flex flex-col max-h-[90dvh] outline-none animate-scale-in ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        {(title || Icon || showCloseButton || headerRight) && (
          <div className="flex items-center justify-between px-4 sm:px-6 pt-5 pb-4 border-b border-line shrink-0 bg-surface">
            <div className="flex items-center gap-3 min-w-0 pr-2">
              {Icon && (
                <div className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${iconBg} ${iconColor}`}>
                  {React.isValidElement(Icon) ? Icon : <Icon className="w-4.5 h-4.5" />}
                </div>
              )}
              <div className="min-w-0">
                {title && (
                  <h2 id={titleId} className="text-sm sm:text-base font-semibold text-text tracking-tight truncate">
                    {title}
                  </h2>
                )}
                {description && (
                  <p id={descId} className="text-xs text-text-secondary mt-0.5 leading-snug">
                    {description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {headerRight}
              {showCloseButton && (
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-surface-2 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
                  aria-label="Close dialog"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className={`flex-1 overflow-y-auto ${bodyClassName}`}>
          {children}
        </div>

        {/* Optional Footer */}
        {footer && (
          <div className="px-4 sm:px-6 py-3.5 border-t border-line bg-surface-2/40 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(content, document.body) : content;
};

export default Modal;
