import './TextSubtitle.css';

interface TextSubtitleProps {
  children: React.ReactNode;
}

export default function TextSubtitle({ children }: TextSubtitleProps) {
  return <span className='text-subtitle'>{children}</span>;
}
