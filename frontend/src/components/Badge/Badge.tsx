import './Badge.css';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'neutral' | 'primary' | 'success';
}

export default function Badge({ children, variant = 'neutral' }: BadgeProps) {
  return <span className={`badge badge--${variant}`}>{children}</span>;
}
