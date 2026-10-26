import './PageHeader.css';
import TextPageTitle from '@components/TextPageTitle/TextPageTitle';
import TextSubtitle from '@components/TextSubtitle/TextSubtitle';

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
        {subtitle && <TextSubtitle>{subtitle}</TextSubtitle>}
      </div>
      {aside && <div className='page-header__aside'>{aside}</div>}
    </header>
  );
}
