import React, { useState, useCallback } from 'react';
import { Copy, Check } from 'lucide-react';

/**
 * CopyButton: High-fidelity animated copy button.
 * Morphs between Copy and Check icons with smooth spring rotation,
 * emerald specular halo pulse, and fallback clipboard support.
 */
export default function CopyButton({
  text = '',
  label = null,
  copiedLabel = 'Copied!',
  className = '',
  title = 'Copy to clipboard',
  disabled = false,
  onCopySuccess = null,
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async (e) => {
    e.stopPropagation();
    if (!text || disabled) return;

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers or non-secure contexts
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }

      setCopied(true);
      if (onCopySuccess) onCopySuccess();

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.warn('Failed to copy to clipboard:', err);
    }
  }, [text, disabled, onCopySuccess]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={disabled || !text}
      title={copied ? 'Copied to clipboard' : title}
      aria-label={copied ? 'Copied to clipboard' : title}
      className={`relative inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none active:scale-95 ${
        copied
          ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
          : 'bg-surface-2 hover:bg-surface-hover text-text-secondary hover:text-text border border-line'
      } ${className}`}
    >
      {/* Animated Icon Container */}
      <span className="relative w-3.5 h-3.5 flex items-center justify-center shrink-0">
        <Copy
          className={`w-3.5 h-3.5 absolute inset-0 transition-all duration-200 ${
            copied ? 'scale-0 rotate-45 opacity-0' : 'scale-100 rotate-0 opacity-100'
          }`}
        />
        <Check
          className={`w-3.5 h-3.5 absolute inset-0 text-emerald-400 transition-all duration-200 ${
            copied ? 'scale-100 rotate-0 opacity-100' : 'scale-0 -rotate-45 opacity-0'
          }`}
        />
      </span>

      {/* Optional Label */}
      {label && (
        <span
          className={`transition-colors duration-200 ${
            copied ? 'text-emerald-400 font-semibold' : 'text-text-secondary'
          }`}
        >
          {copied ? copiedLabel : label}
        </span>
      )}
    </button>
  );
}
