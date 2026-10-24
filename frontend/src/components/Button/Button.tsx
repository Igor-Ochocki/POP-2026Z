import type { ButtonHTMLAttributes } from 'react';
import './Button.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

export default function Button({
  variant = 'secondary',
  className = '',
  ...props
}: ButtonProps) {
  return <button className={`btn btn-${variant} ${className}`} {...props} />;
}
