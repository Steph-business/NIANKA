import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  fullWidth = true,
  className = '',
  style: customStyle,
  ...props
}) => {
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 'var(--space-xs)',
    width: fullWidth ? '100%' : 'auto',
    marginBottom: 'var(--space-md)',
  };

  const labelStyle = {
    fontSize: '14px',
    fontWeight: 500,
    color: 'var(--color-on-surface-variant)',
  };

  const inputStyle = {
    padding: 'var(--space-sm) var(--space-md)',
    borderRadius: 'var(--radius-md)',
    border: error ? '1px solid var(--color-error)' : '1px solid var(--color-outline)',
    backgroundColor: 'var(--color-surface-container-lowest)',
    color: 'var(--color-on-surface)',
    fontSize: '16px',
    outline: 'none',
    transition: 'border-color 0.2s',
  };

  const errorStyle = {
    fontSize: '12px',
    color: 'var(--color-error)',
  };

  return (
    <div style={containerStyle} className={className}>
      {label && <label style={labelStyle}>{label}</label>}
      <input
        style={{ ...inputStyle, ...customStyle }}
        {...props}
      />
      {error && <span style={errorStyle}>{error}</span>}
    </div>
  );
};
