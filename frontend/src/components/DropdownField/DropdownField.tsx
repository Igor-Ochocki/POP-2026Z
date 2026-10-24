import './DropdownField.css';
import TextLabel from '@components/TextLabel/TextLabel';
import Dropdown from '@components/Dropdown/Dropdown';
import { useState } from 'react';
import MenuItemList from '@components/MenuItemList/MenuItemList';

interface DropdownFieldProps {
  label: React.ReactNode;
  options: string[];
  onOptionSelected: (option: string) => void;
}

export default function DropdownField({
  label,
  options,
  onOptionSelected,
}: DropdownFieldProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [display, setDisplay] = useState('wybierz...');

  return (
    <label className='dropdown-field'>
      <TextLabel>{label}</TextLabel>
      <Dropdown
        label={display}
        open={dropdownOpen}
        onToggleOpen={() => setDropdownOpen(!dropdownOpen)}
      />
      {dropdownOpen && (
        <div className='dropdown-field__menu'>
          <MenuItemList
            items={options.map((option) => ({
              label: option,
              onClick: () => {
                onOptionSelected(option);
                setDisplay(option);
                setDropdownOpen(false);
              },
            }))}
          />
        </div>
      )}
    </label>
  );
}
