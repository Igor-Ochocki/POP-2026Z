import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import './Dropdown.css';

export interface DropdownProps {
  label: string;
  open: boolean;
  onToggleOpen: () => void;
  error?: boolean;
}

export default function Dropdown({
  label,
  open,
  onToggleOpen,
  error,
}: DropdownProps) {
  return (
    <button
      type='button'
      className={`dropdown ${open ? 'dropdown--active' : ''} ${
        error ? 'dropdown--error' : ''
      }`}
      onClick={() => onToggleOpen()}
    >
      <div className='dropdown__icon'>
        {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
      </div>
      <span>{label}</span>
    </button>
  );
}
