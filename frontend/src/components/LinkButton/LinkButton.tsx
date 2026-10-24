import { Link } from 'react-router';
import '@components/Button/Button.css';
import type { ButtonProps } from '@components/Button/Button';

interface LinkButtonProps extends Pick<ButtonProps, "variant"> {
  children: React.ReactNode;
  to: string;
}

export default function LinkButton({
  children,
  variant = 'primary',
  to,
}: LinkButtonProps) {
  return (
    <Link className={`button button--${variant}`} to={to}>
      {children}
    </Link>
  );
}
