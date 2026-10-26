import './PageHeader.css';
import TextPageTitle from '@components/TextPageTitle/TextPageTitle';

interface PageHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  aside?: React.ReactNode;
}

export default function PageHeader({
  title,
  subtitle,
  aside,
}: PageHeaderProps) {
  return (
    <header className='page-header'>
      <div className='page-header__text'>
        <TextPageTitle>{title}</TextPageTitle>
        {subtitle && <span className='page-header__subtitle'>{subtitle}</span>}
      </div>
      {aside && <div className='page-header__aside'>{aside}</div>}
    </header>
  );
}
