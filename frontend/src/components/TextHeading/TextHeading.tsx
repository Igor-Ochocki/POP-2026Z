import './TextHeading.css';

interface TextHeadingProps {
  children: React.ReactNode;
  level: 1 | 2 | 3 | 4 | 5 | 6;
}

export default function TextHeading({ children, level }: TextHeadingProps) {
  return (
    <>
      {(() => {
        switch (level) {
          case 1:
            return <h1 className='text-heading'>{children}</h1>;
          case 2:
            return <h2 className='text-heading'>{children}</h2>;
          case 3:
            return <h3 className='text-heading'>{children}</h3>;
          case 4:
            return <h4 className='text-heading'>{children}</h4>;
          case 5:
            return <h5 className='text-heading'>{children}</h5>;
          case 6:
            return <h6 className='text-heading'>{children}</h6>;
        }
      })()}
    </>
  );
}
