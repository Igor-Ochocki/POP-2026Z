import './TextPageTitle.css';

interface TextPageTitleProps {
  children: React.ReactNode;
}

export default function TextPageTitle({ children }: TextPageTitleProps) {
  return <h1 className='text-page-title'>{children}</h1>;
}
