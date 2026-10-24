import './TextLabel.css';

interface TextLabelProps {
  children: React.ReactNode;
}

export default function TextLabel({ children }: TextLabelProps) {
  return <span className='text-label'>{children}</span>;
}
