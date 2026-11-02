import type { ChangeEvent } from 'react';
import './TextArea.css';

export interface TextAreaProps {
  value?: string;
  name?: string;
  placeholder?: string;
  onChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  error?: boolean;
}

export default function TextArea({
  value,
  name,
  placeholder,
  onChange,
  error,
}: TextAreaProps) {
  return (
    <textarea
      className={`text-area ${error ? 'text-area--error' : ''}`}
      value={value}
      name={name}
      placeholder={placeholder}
      onChange={onChange}
    />
  );
}
