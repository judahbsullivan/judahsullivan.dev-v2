import { forwardRef } from 'react';
import { tw } from '@/lib/tw';

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  className?: string;
  fullWidth?: boolean;
  id?: string;
  fullHeight?: boolean;
  background?: string | boolean;
  children?: React.ReactNode;
}

export const Section = forwardRef<HTMLElement, SectionProps>(function Section(
  {
    className,
    fullWidth = false,
    id,
    fullHeight = false,
    background = false,
    children,
    ...props
  },
  ref
) {
  const containerClasses = fullWidth
    ? 'w-full relative overflow-hidden'
    : 'max-w-7xl mx-auto px-4 relative overflow-hidden md:px-12';

  return (
    <section
      ref={ref}
      id={id}
      className={tw(
        typeof background === 'string' ? background : '',
        'relative z-20',
        containerClasses,
        fullHeight && 'min-h-dvh',
        className
      )}
      {...props}
    >
      {children}
    </section>
  );
});
