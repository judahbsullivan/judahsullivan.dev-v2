import { tw } from '@/lib/tw';
import { forwardRef } from 'react';

interface PProps extends React.HTMLAttributes<HTMLParagraphElement> {
  className?: string;
}

export const P = forwardRef<HTMLParagraphElement, PProps>(
  function P({ className, children, ...props }, ref) {
    return (
      <p ref={ref} className={tw('', className)} {...props}>
        {children}
      </p>
    );
  }
);

