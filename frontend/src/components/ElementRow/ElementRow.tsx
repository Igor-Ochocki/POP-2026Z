import './ElementRow.css';

interface ElementRowProps {
  children: React.ReactNode;
}

export default function ElementRow({ children }: ElementRowProps) {
  return <div className='element-row'>{children}</div>;
}
