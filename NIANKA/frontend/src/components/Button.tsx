import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  ...props
}) => {
  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 500,
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    width: fullWidth ? '100%' : 'auto',
  };

  const variants = {
    primary: {
      backgroundColor: 'var(--color-primary)',
      color: 'var(--color-on-primary)',
      borderRadius: 'var(--radius-md)',
    },
    secondary: {
      backgroundColor: 'var(--color-secondary-container)',
      color: 'var(--color-on-secondary-container)',
      borderRadius: 'var(--radius-md)',
    },
    outline: {
      backgroundColor: 'transparent',
      color: 'var(--color-primary)',
      border: '1px solid var(--color-primary)',
      borderRadius: 'var(--radius-md)',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: 'var(--color-on-surface-variant)',
      borderRadius: 'var(--radius-md)',
    },
  };

  const sizes = {
    sm: { padding: 'var(--space-xs) var(--space-sm)', fontSize: '14px' },
    md: { padding: 'var(--space-sm) var(--space-md)', fontSize: '16px' },
    lg: { padding: 'var(--space-md) var(--space-lg)', fontSize: '18px' },
  };

  const style = {
    ...baseStyle,
    ...variants[variant],
    ...sizes[size],
  };

  return (
    <button style={style} className={`btn-hover ${className}`} {...props}>
      {children}
    </button>
  );
};
