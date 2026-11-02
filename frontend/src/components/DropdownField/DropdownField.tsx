import './DropdownField.css';
import TextLabel from '@components/TextLabel/TextLabel';
import Dropdown from '@components/Dropdown/Dropdown';
import { useState } from 'react';
import MenuItemList from '@components/MenuItemList/MenuItemList';

interface DropdownFieldProps {
  label: React.ReactNode;
  options: string[];
  onOptionSelected: (option: string) => void;
  value?: string;
  errorText?: string;
}

export default function DropdownField({
  label,
  options,
  onOptionSelected,
  value,
  errorText,
}: DropdownFieldProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [display, setDisplay] = useState(value || 'wybierz...');

  return (
    <label className='dropdown-field'>
      <TextLabel>{label}</TextLabel>
      <div className='dropdown-field__control'>
        <Dropdown
          label={display}
          open={dropdownOpen}
          error={errorText !== undefined && errorText.length > 0}
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
      </div>
      <div className='dropdown-field__error-text'>
        <TextLabel>{errorText}</TextLabel>
      </div>
    </label>
  );
}
