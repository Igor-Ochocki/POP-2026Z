import './FormSection.css';
import TextSubheading from '@components/TextSubheading/TextSubheading';

interface FormSectionProps {
  title: string;
  children: React.ReactNode;
}

export default function FormSection({ title, children }: FormSectionProps) {
  return (
    <section className='form-section'>
      <div className='form-section__header'>
        <TextSubheading level={3}>{title}</TextSubheading>
      </div>
      <div className='form-section__content'>{children}</div>
    </section>
  );
}
