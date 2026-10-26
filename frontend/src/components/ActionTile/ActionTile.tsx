import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Link } from 'react-router';
import TextLabel from '@components/TextLabel/TextLabel';
import './ActionTile.css';

interface ActionTileProps {
  icon: React.ReactNode;
  title: string;
  description?: React.ReactNode;
  badge?: React.ReactNode;
  to?: string;
  onClick?: () => void;
}

export default function ActionTile({
  icon,
  title,
  description,
  badge,
  to,
  onClick,
}: ActionTileProps) {
  const content = (
    <>
      <span className='action-tile__icon'>{icon}</span>
      <span className='action-tile__text'>
        <span className='action-tile__heading'>
          <span className='action-tile__title'>{title}</span>
          {badge}
        </span>
        {description && (
          <span className='action-tile__description'>
            <TextLabel>{description}</TextLabel>
          </span>
        )}
      </span>
      <ChevronRightIcon className='action-tile__chevron' fontSize='small' />
    </>
  );

  if (to) {
    return (
      <Link className='action-tile' to={to}>
        {content}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button type='button' className='action-tile' onClick={onClick}>
        {content}
      </button>
    );
  }

  return (
    <div className='action-tile action-tile--disabled' aria-disabled='true'>
      {content}
    </div>
  );
}
