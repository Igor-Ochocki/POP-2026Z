import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import './Dropdown.css';

export interface DropdownProps {
  label: string;
  open: boolean;
  onToggleOpen: () => void;
}

export default function Dropdown({ label, open, onToggleOpen }: DropdownProps) {
  return (
    <button
      className={`dropdown ${open ? 'dropdown--active' : ''}`}
      onClick={() => onToggleOpen()}
    >
      <div className='dropdown__icon'>
        {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
      </div>
      <span>{label}</span>
    </button>
  );
}
