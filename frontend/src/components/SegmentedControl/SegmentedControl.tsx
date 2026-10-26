import './SegmentedControl.css';
import TextLabel from '@components/TextLabel/TextLabel';

export interface SegmentedOption<T> {
  label: string;
  value: T;
}

interface SegmentedControlProps<T> {
  label: React.ReactNode;
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

export default function SegmentedControl<T extends string | number | boolean>({
  label,
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <div className='segmented-control'>
      <TextLabel>{label}</TextLabel>
      <div className='segmented-control__options' role='radiogroup'>
        {options.map((option) => (
          <button
            key={String(option.value)}
            type='button'
            role='radio'
            aria-checked={option.value === value}
            className={`segmented-control__option ${
              option.value === value ? 'segmented-control__option--active' : ''
            }`}
            onClick={() => onChange(option.value)}
          >
            <TextLabel>{option.label}</TextLabel>
          </button>
        ))}
      </div>
    </div>
  );
}
