import { forwardRef } from "react";

type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5";

interface HeadlineProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: HeadingTag;
}

export const Headline = forwardRef<HTMLHeadingElement, HeadlineProps>(
  function Headline({ as: Tag = "h1", className, children, ...rest }, ref) {
    return (
      <Tag ref={ref} className={className} {...rest}>
        {children}
      </Tag>
    );
  }
);

