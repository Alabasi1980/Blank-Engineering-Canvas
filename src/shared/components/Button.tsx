
import React from 'react';
import { useCompany } from '../../context/CompanyContext';
import { AudioEngine } from '../../core/services/AudioEngine';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'info' | 'warning' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  disabled,
  className,
  children,
  onClick,
  onMouseEnter,
  ...props
}) => {
  const { config } = useCompany();
  const soundEnabled = config.branding.theme?.soundEnabled;

  const baseClasses = 'btn-fantasy flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none';
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-8 py-3.5 text-base',
  };

  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500 hover:text-white hover:shadow-[0_0_15px_rgba(239,68,68,0.4)]',
    info: 'bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500 hover:text-white hover:shadow-[0_0_15px_rgba(59,130,246,0.4)]',
    warning: 'bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500 hover:text-white hover:shadow-[0_0_15px_rgba(245,158,11,0.4)]',
    success: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500 hover:text-white hover:shadow-[0_0_15px_rgba(16,185,129,0.4)]',
  };

  const finalClassName = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className || ''}`;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (soundEnabled && !disabled && !isLoading) AudioEngine.play('click');
      if (onClick) onClick(e);
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (soundEnabled && !disabled) AudioEngine.play('hover');
      if (onMouseEnter) onMouseEnter(e);
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={finalClassName}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      {...props}
    >
      {isLoading && <span className="animate-spin opacity-70">⏳</span>}
      {icon && !isLoading && <span className="opacity-90">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};
