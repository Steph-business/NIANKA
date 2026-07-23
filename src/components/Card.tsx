import React, { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  elevation?: 'sm' | 'md' | 'lg';
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  elevation = 'sm',
  noPadding = false,
  className = '',
  style: customStyle,
  ...props
}) => {
  const baseStyle = {
    backgroundColor: 'var(--color-surface-container-lowest)',
    borderRadius: 'var(--radius-lg)',
    padding: noPadding ? '0' : 'var(--space-lg)',
    border: '1px solid var(--color-outline-variant)',
  };

  const elevations = {
    sm: { boxShadow: 'var(--shadow-sm)' },
    md: { boxShadow: 'var(--shadow-md)' },
    lg: { boxShadow: 'var(--shadow-lg)' },
  };

  const style = {
    ...baseStyle,
    ...elevations[elevation],
    ...customStyle,
  };

  return (
    <div style={style} className={`card-hover ${className}`} {...props}>
      {children}
    </div>
  );
};
