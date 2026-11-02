import './SubtitledListItem.css';

export interface SubtitledListItemProps {
  label: string;
  subtitle: string;
  text?: string;
  highlight?: boolean;
}

export default function SubtitledListItem({
  label,
  text,
  subtitle,
  highlight,
}: SubtitledListItemProps) {
  return (
    <div
      className={`subtitled-list-item ${highlight ? 'subtitled-list-item--highlight' : ''}`}
    >
      <div className='subtitled-list-item__label'>{label}</div>
      <div className='subtitled-list-item__subtitle'>{subtitle}</div>
      {text && <div className='subtitled-list-item__text'>{text}</div>}
    </div>
  );
}
