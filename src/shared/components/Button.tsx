
import React from 'react';
import { Loader2 } from 'lucide-react';
import { useCompany } from '../../context/CompanyContext';
import { AudioEngine } from '../../core/services/AudioEngine';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'warning';
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  size = 'md',
  variant = 'primary',
  disabled = false,
  loading = false,
  icon,
  fullWidth = false,
  onClick,
  className = '',
  type = 'button',
  onMouseEnter,
  ...props
}) => {
  const { config } = useCompany();
  const soundEnabled = config.branding.theme?.soundEnabled;

  // 1. Base Styles (Using Design Tokens via Tailwind arbitrary values where possible)
  const baseStyles = 'inline-flex items-center justify-center font-[var(--font-weight-semibold)] rounded-[var(--radius-md)] transition-[var(--transition-normal)] focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95';
  
  // 2. Size Styles
  const sizeStyles = {
    xs: 'px-[var(--spacing-sm)] py-1 text-[var(--font-size-xs)] gap-[var(--spacing-xs)]',
    sm: 'px-[var(--spacing-md)] py-[var(--spacing-sm)] text-[var(--font-size-sm)] gap-[var(--spacing-sm)]',
    md: 'px-[var(--spacing-lg)] py-[var(--spacing-md)] text-[var(--font-size-base)] gap-[var(--spacing-md)]',
    lg: 'px-[var(--spacing-xl)] py-[var(--spacing-lg)] text-[var(--font-size-lg)] gap-[var(--spacing-md)]',
  };

  // 3. Variant Styles
  const variantStyles = {
    primary: 'bg-primary-600 hover:bg-primary-500 text-white border border-transparent shadow-[var(--shadow-sm)] focus:ring-primary-500',
    secondary: 'bg-secondary hover:bg-secondary/80 text-white border border-transparent shadow-[var(--shadow-sm)] focus:ring-secondary',
    ghost: 'bg-transparent border border-[var(--border-subtle)] hover:bg-[var(--surface-card)] text-[var(--text-main)] focus:ring-[var(--border-highlight)]',
    danger: 'bg-red-600/80 hover:bg-red-500 text-white border border-transparent shadow-[var(--shadow-sm)] focus:ring-red-500',
    warning: 'bg-amber-600/80 hover:bg-amber-500 text-white border border-transparent shadow-[var(--shadow-sm)] focus:ring-amber-500',
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !loading) {
      if (soundEnabled) AudioEngine.play('click');
      if (onClick) onClick(e);
    }
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (soundEnabled && !disabled && !loading) AudioEngine.play('hover');
    if (onMouseEnter) onMouseEnter(e);
  };

  return (
    <button
      type={type}
      className={`
        ${baseStyles}
        ${sizeStyles[size]}
        ${variantStyles[variant]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={disabled || loading}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      {...props}
    >
      {loading && (
        <Loader2 className="animate-spin" size={size === 'xs' ? 12 : size === 'lg' ? 20 : 16} />
      )}
      {!loading && icon && (
        <span className="flex items-center justify-center opacity-90">{icon}</span>
      )}
      <span>{children}</span>
    </button>
  );
};
