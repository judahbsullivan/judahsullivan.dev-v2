"use client";

import { useRef } from 'react';
import { Section } from '@/components/ui/section';
import { ClipPathLinks } from '@/components/ui/clip-path-links';
import { useTextAnimations } from '@/hooks/useTextAnimations';

interface BlockDescriptionProps {
  tagline?: string | null;
  headline?: string | null;
  description?: string | null;
}

function BlockDescription({ tagline, headline, description }: BlockDescriptionProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useTextAnimations(
    sectionRef,
    [
      {
        selector: '.desc-title',
        type: 'headline',
      },
      {
        selector: '.desc-text',
        type: 'description',
        position: 0.2,
      },
      {
        selector: '.desc-btn',
        type: 'button',
        position: 0.4,
      },
    ],
    {
      start: 'top 80%',
      once: true,
    },
    [tagline, headline, description]
  );

  return (
    <Section
      ref={sectionRef}
      id="block-description"
      fullWidth
      className="min-h-screen py-12 w-full flex flex-col items-center justify-between gap-5 md:justify-between px-6"
    >
      <div className="w-full flex flex-col justify-start">
        <div className="max-w-6xl">
          <h2 className="text-xl desc-text relative uppercase tracking-wider text-neutral-600 mb-1">
            {tagline}
          </h2>
          <h3
            className="desc-title text-5xl md:text-[5vw] leading-[.89] uppercase font-light"
          >
            {headline}
          </h3>
        </div>
      </div>
      <div className="w-full">
        <ClipPathLinks />
      </div>
      <div className="w-full flex justify-end">
        <div className="max-w-2xl space-y-6">
          <p
            id=""
            className="desc-text text-2xl font-thin mt-12"
          >
            {description}
          </p>
        </div>
      </div>
    </Section>
  );
}

export default BlockDescription;
export { BlockDescription };
