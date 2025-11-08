"use client";

import NextLink from "next/link";
import { forwardRef } from "react";
import type { ComponentProps } from "react";
import { TransitionLink } from "@/components/globals/PageTransition";

interface LinkProps extends ComponentProps<typeof NextLink> {
  label?: string;
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { className, href, label, children, ...rest },
  ref
) {
  const combinedClass = className ?? "";
  const content = label ?? children;
  const isInternal =
    typeof href === "string" ? href.startsWith("/") : !!href?.pathname?.startsWith?.("/");

  if (isInternal && href) {
    return (
      <TransitionLink
        ref={ref}
        href={href}
        className={combinedClass}
        {...rest}
      >
        {content}
      </TransitionLink>
    );
  }

  return (
    <NextLink ref={ref} href={href ?? "#"} className={combinedClass} {...rest}>
      {content}
    </NextLink>
  );
});