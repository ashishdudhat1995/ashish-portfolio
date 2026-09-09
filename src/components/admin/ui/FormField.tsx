import React from 'react';

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  helpText?: string;
  hint?: string;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  required,
  helpText,
  hint,
  children
}) => {
  const noteText = helpText || hint;

  return (
    <div className="space-y-1.5 font-mono text-xs">
      <div className="flex items-center justify-between">
        <label className="block text-gray-300 uppercase text-[10px] font-bold tracking-wider">
          {label} {required && <span className="text-rose-400">*</span>}
        </label>
        {error && (
          <span className="text-rose-400 text-[10px] font-semibold">{error}</span>
        )}
      </div>

      {children}

      {noteText && !error && (
        <p className="text-gray-500 text-[10px]">{noteText}</p>
      )}
    </div>
  );
};
