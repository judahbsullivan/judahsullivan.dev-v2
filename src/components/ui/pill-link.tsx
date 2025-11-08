"use client";

import { forwardRef, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import SplitText from "gsap/SplitText";
import ScrollTrigger from "gsap/ScrollTrigger";
import { tw } from "@/lib/tw";
import { Link } from "./link";

gsap.registerPlugin(SplitText, ScrollTrigger);

interface PillLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  label?: string;
}

export const PillLink = forwardRef<HTMLAnchorElement, PillLinkProps>(
  function PillLink({ href, label, className, children, ...rest }, ref) {
    const buttonRef = useRef<HTMLAnchorElement>(null);
    const combinedRef = (ref || buttonRef) as React.RefObject<HTMLAnchorElement>;

    const classes = tw(
      "inline-flex items-center gap-2 px-6 py-3 rounded-full border relative overflow-hidden",
      "border-neutral-800 bg-neutral-900 text-white",
      "uppercase tracking-wide text-sm md:text-base",
      "hover:border-neutral-700 hover:bg-neutral-800 transition-colors duration-200",
      "group",
      className
    );

    // Button animation: scale left to right, then split text
    useGSAP(() => {
      const button = combinedRef.current;
      if (!button) return;

      // Find the text span inside the button
      const buttonText = button.querySelector('span.relative') || button.querySelector('span') || button;
      
      // Split text into lines
      const split = new SplitText(buttonText as Element, {
        type: 'lines, words',
        linesClass: 'line',
        wordsClass: 'word',
        mask: 'lines',
        smartWrap: true,
      });

      // Set initial states
      gsap.set(button, { scaleX: 0, transformOrigin: 'left center' });
      gsap.set(split.lines, { yPercent: 100, opacity: 0 });

      // Create timeline: first scale button, then animate text
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: button,
          start: 'top 90%',
          once: true,
        },
      });

      // Scale button from left to right
      tl.to(button, {
        scaleX: 1,
        duration: 0.6,
        ease: 'power3.out',
      })
      // Then animate text lines in
      .to(split.lines, {
        yPercent: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.05,
        ease: 'power4.out',
      }, '-=0.3'); // Start text animation slightly before button finishes
    }, { scope: combinedRef });

    return (
      <Link ref={combinedRef} href={href} className={classes} {...rest}>
        <div className="absolute inset-0 bg-linear-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <span className="relative z-10">{label ? label : children}</span>
      </Link>
    );
  }
);

