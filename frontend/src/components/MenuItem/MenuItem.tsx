import './MenuItem.css';

export interface MenuItemProps {
  label: string;
  image?: React.ReactNode;
  onClick?: () => void;
}

export default function MenuItem({ label, image, onClick }: MenuItemProps) {
  return (
    <li>
      <button onClick={onClick} className='menu-item'>
        <span>{label}</span>
        {image && image}
      </button>
    </li>
  );
}
