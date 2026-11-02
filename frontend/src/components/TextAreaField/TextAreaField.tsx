import './TextAreaField.css';
import type { TextAreaProps } from '@components/TextArea/TextArea';
import TextArea from '@components/TextArea/TextArea';
import TextLabel from '@components/TextLabel/TextLabel';

interface TextAreaFieldProps {
  label: React.ReactNode;
  textAreaProps?: TextAreaProps;
  errorText?: string;
}

export default function TextAreaField({
  label,
  textAreaProps,
  errorText,
}: TextAreaFieldProps) {
  return (
    <label className='text-area-field'>
      <TextLabel>{label}</TextLabel>
      <TextArea
        error={errorText !== undefined && errorText.length > 0}
        {...textAreaProps}
      />
      <div className='text-area-field__error-text'>
        <TextLabel>{errorText}</TextLabel>
      </div>
    </label>
  );
}
