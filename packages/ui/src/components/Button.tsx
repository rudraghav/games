import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { LoaderCircle } from 'lucide-react';
import { cn } from '../lib/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  pending?: boolean;
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  pending = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={cn('button', `button--${variant}`, `button--${size}`, className)}
      disabled={disabled || pending}
      aria-busy={pending || undefined}
    >
      {pending ? <LoaderCircle className="spin" size={16} aria-hidden="true" /> : null}
      {children}
    </button>
  );
}
