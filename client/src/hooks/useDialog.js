import { useEffect, useRef, useCallback } from 'react';

// Global reference counter for multi-modal scroll locking
let activeModalCount = 0;
let originalBodyOverflow = '';

/**
 * Standard CSS selector for all tabbable interactive elements
 */
const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"]):not([disabled])',
].join(', ');

/**
 * Helper to get visible focusable elements inside a container
 */
const getFocusableElements = (container) => {
  if (!container) return [];
  const elements = Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR));
  return elements.filter((el) => {
    // Check if element or any parent is hidden
    return (
      el.offsetWidth > 0 ||
      el.offsetHeight > 0 ||
      el.getClientRects().length > 0 ||
      el === document.activeElement
    );
  });
};

/**
 * useDialog — High-performance, zero-dependency accessibility hook for modals & dialogs.
 *
 * Provides:
 * - Tab / Shift+Tab focus trap (prevents keyboard focus from leaking into background)
 * - Initial focus management (focuses initialFocusRef or first focusable element)
 * - Focus restoration to the trigger element on unmount/close
 * - Escape key to close (with e.stopPropagation to prevent parent listeners triggering)
 * - Coordinated body scroll lock (reference counted for stacked/nested modals)
 *
 * @param {Object} options
 * @param {boolean} options.isOpen — whether the dialog is open
 * @param {Function} options.onClose — callback invoked when Escape or backdrop requested
 * @param {React.RefObject} [options.dialogRef] — ref to the dialog card/container element
 * @param {React.RefObject} [options.initialFocusRef] — element to focus when dialog opens
 * @param {React.RefObject} [options.returnFocusRef] — explicit element to restore focus to on close
 * @param {boolean} [options.closeOnEscape=true] — whether pressing Escape invokes onClose
 * @param {boolean} [options.lockScroll=true] — whether to lock document.body scroll
 */
export const useDialog = ({
  isOpen,
  onClose,
  dialogRef,
  initialFocusRef,
  returnFocusRef,
  closeOnEscape = true,
  lockScroll = true,
}) => {
  const previousActiveElement = useRef(null);

  // 1. Capture trigger element when modal opens
  useEffect(() => {
    if (isOpen) {
      if (typeof document !== 'undefined') {
        previousActiveElement.current = document.activeElement;
      }
    }
  }, [isOpen]);

  // 2. Coordinated body scroll locking
  useEffect(() => {
    if (!isOpen || !lockScroll || typeof document === 'undefined') return;

    if (activeModalCount === 0) {
      originalBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }
    activeModalCount++;

    return () => {
      activeModalCount = Math.max(0, activeModalCount - 1);
      if (activeModalCount === 0) {
        document.body.style.overflow = originalBodyOverflow;
      }
    };
  }, [isOpen, lockScroll]);

  // 3. Initial focus management
  useEffect(() => {
    if (!isOpen) return;

    const frameId = requestAnimationFrame(() => {
      if (initialFocusRef?.current) {
        initialFocusRef.current.focus();
        return;
      }

      if (dialogRef?.current) {
        // Look for [data-autofocus] or autofocus attribute first
        const autoFocusEl = dialogRef.current.querySelector('[data-autofocus], [autofocus]');
        if (autoFocusEl && typeof autoFocusEl.focus === 'function') {
          autoFocusEl.focus();
          return;
        }

        const focusables = getFocusableElements(dialogRef.current);
        if (focusables.length > 0) {
          focusables[0].focus();
        } else {
          // If no focusable children, focus dialog container itself if it has tabindex="-1"
          dialogRef.current.focus?.();
        }
      }
    });

    return () => cancelAnimationFrame(frameId);
  }, [isOpen, dialogRef, initialFocusRef]);

  // 4. Focus restoration upon close / unmount
  useEffect(() => {
    return () => {
      const target = returnFocusRef?.current || previousActiveElement.current;
      if (target && typeof target.focus === 'function' && document.body.contains(target)) {
        // Use requestAnimationFrame to ensure unmounted modal elements have vacated
        requestAnimationFrame(() => {
          try {
            target.focus();
          } catch (_) {
            // Safe fallback if target detached
          }
        });
      }
    };
  }, [returnFocusRef]);

  // Also restore focus when isOpen becomes false without unmounting
  const wasOpenRef = useRef(isOpen);
  useEffect(() => {
    if (wasOpenRef.current && !isOpen) {
      const target = returnFocusRef?.current || previousActiveElement.current;
      if (target && typeof target.focus === 'function' && document.body.contains(target)) {
        requestAnimationFrame(() => {
          try {
            target.focus();
          } catch (_) {}
        });
      }
    }
    wasOpenRef.current = isOpen;
  }, [isOpen, returnFocusRef]);

  // 5. Global Keyboard Listener: Focus Trap & Escape Key
  const handleKeyDown = useCallback(
    (e) => {
      if (!isOpen) return;

      // Escape to close
      if (e.key === 'Escape' && closeOnEscape) {
        e.preventDefault();
        e.stopPropagation();
        onClose?.();
        return;
      }

      // Focus Trap (Tab & Shift+Tab)
      if (e.key === 'Tab') {
        const container = dialogRef?.current;
        if (!container) return;

        const focusables = getFocusableElements(container);
        if (focusables.length === 0) {
          e.preventDefault();
          return;
        }

        const firstEl = focusables[0];
        const lastEl = focusables[focusables.length - 1];
        const activeEl = document.activeElement;

        if (e.shiftKey) {
          // Shift + Tab
          if (activeEl === firstEl || !container.contains(activeEl)) {
            e.preventDefault();
            lastEl.focus();
          }
        } else {
          // Tab
          if (activeEl === lastEl || !container.contains(activeEl)) {
            e.preventDefault();
            firstEl.focus();
          }
        }
      }
    },
    [isOpen, closeOnEscape, onClose, dialogRef]
  );

  useEffect(() => {
    if (!isOpen) return;
    window.addEventListener('keydown', handleKeyDown, true); // capture phase
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, handleKeyDown]);

  return {
    handleKeyDown,
  };
};

export default useDialog;
