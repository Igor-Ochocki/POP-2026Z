import './MenuItemList.css';
import type { MenuItemProps } from '@components/MenuItem/MenuItem';
import MenuItem from '@components/MenuItem/MenuItem';

interface MenuItemListProps {
  items: MenuItemProps[];
}

export default function MenuItemList({ items }: MenuItemListProps) {
  return (
    <ul className='menu-item-list'>
      {items.map((item, i) => (
        <MenuItem {...item} key={i} />
      ))}
    </ul>
  );
}
