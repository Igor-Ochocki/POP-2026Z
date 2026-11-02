import type { ChangeEvent, HTMLInputTypeAttribute } from 'react';
import './Input.css';

export interface InputProps {
  value?: string | number;
  name?: string;
  placeholder?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  type?: HTMLInputTypeAttribute;
  required?: boolean;
  error?: boolean;
}

export default function Input({
  value,
  name,
  placeholder,
  onChange,
  type = 'text',
  required,
  error,
}: InputProps) {
  return (
    <input
      className={`input ${error ? 'input--error' : ''}`}
      type={type}
      value={value}
      name={name}
      placeholder={placeholder}
      onChange={onChange}
      required={required}
    />
  );
}
