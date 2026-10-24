import './TextSubheading.css';

interface TextSubheadingProps {
  children: React.ReactNode;
  level: 1 | 2 | 3 | 4 | 5 | 6;
}

export default function TextSubheading({
  children,
  level,
}: TextSubheadingProps) {
  return (
    <>
      {(() => {
        switch (level) {
          case 1:
            return <h1 className='text-subheading'>{children}</h1>;
          case 2:
            return <h2 className='text-subheading'>{children}</h2>;
          case 3:
            return <h3 className='text-subheading'>{children}</h3>;
          case 4:
            return <h4 className='text-subheading'>{children}</h4>;
          case 5:
            return <h5 className='text-subheading'>{children}</h5>;
          case 6:
            return <h6 className='text-subheading'>{children}</h6>;
        }
      })()}
    </>
  );
}
