import './FormSection.css';

interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export default function FormSection({
  title,
  description,
  children,
}: FormSectionProps) {
  return (
    <section className='form-section'>
      <div className='form-section__header'>
        <h3 className='form-section__title'>{title}</h3>
        {description && (
          <p className='form-section__description'>{description}</p>
        )}
      </div>
      <div className='form-section__content'>{children}</div>
    </section>
  );
}
