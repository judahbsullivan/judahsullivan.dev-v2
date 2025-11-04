import { forwardRef } from "react";

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href?: string;
  label?: string;
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  function Link({ className, href, label, children, ...rest }, ref) {
    const combinedClass = className || "";
    
    return (
      <a ref={ref} href={href} className={combinedClass} {...rest}>
        {label ? label : children}
      </a>
    );
  }
);

