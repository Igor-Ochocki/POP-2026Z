import './TextHuge.css';

interface TextHugeProps {
  children: React.ReactNode;
}

export default function TextHuge({ children }: TextHugeProps) {
  return <span className='text-huge'>{children}</span>;
}
