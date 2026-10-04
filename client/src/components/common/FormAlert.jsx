import React from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * FormAlert: Restrained, accessible inline alert for displaying validation
 * and server error messages without overwhelming the form layout.
 */
export default function FormAlert({ message }) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="flex items-start gap-2.5 p-3 rounded-md bg-danger/10 border border-danger/20 text-danger text-xs leading-relaxed"
    >
      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
      <span className="flex-1 font-medium">{message}</span>
    </div>
  );
}
