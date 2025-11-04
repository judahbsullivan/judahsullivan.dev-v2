import { forwardRef } from "react";
import { tw } from "@/lib/tw";

interface PillLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  label?: string;
}

export const PillLink = forwardRef<HTMLAnchorElement, PillLinkProps>(
  function PillLink({ href, label, className, children, ...rest }, ref) {
    const classes = tw(
      "inline-flex items-center gap-2 px-6 py-3 rounded-full border relative overflow-hidden",
      "border-neutral-800 bg-neutral-900/50 text-white",
      "uppercase tracking-wide text-sm md:text-base",
      "hover:border-neutral-700 transition-colors duration-200",
      "group",
      className
    );

    return (
      <a ref={ref} href={href} className={classes} {...rest}>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <span className="relative z-10">{label ? label : children}</span>
      </a>
    );
  }
);

