import type { SubtitledListItemProps } from '@components/SubtitledListItem/SubtitledListItem';
import SubtitledListItem from '@components/SubtitledListItem/SubtitledListItem';

import './SubtitledList.css';

interface SubtitledListProps {
  items: SubtitledListItemProps[];
}

export default function SubtitledList({ items }: SubtitledListProps) {
  return (
    <div className='subtitled-list'>
      {items.map((item, i) => (
        <SubtitledListItem key={i} {...item}></SubtitledListItem>
      ))}
    </div>
  );
}
