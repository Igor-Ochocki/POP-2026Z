import './InputField.css';
import type { InputProps } from '@components/Input/Input';
import Input from '@components/Input/Input';
import TextLabel from '@components/TextLabel/TextLabel';

interface InputFieldProps {
  label: React.ReactNode;
  inputProps?: InputProps;
  errorText?: string;
}

export default function InputField({
  label,
  inputProps,
  errorText,
}: InputFieldProps) {
  return (
    <label className='input-field'>
      <TextLabel>{label}</TextLabel>
      <Input
        error={errorText !== undefined && errorText.length > 0}
        {...inputProps}
      />
      <div className='input-field__error-text'>
        <TextLabel>{errorText}</TextLabel>
      </div>
    </label>
  );
}
