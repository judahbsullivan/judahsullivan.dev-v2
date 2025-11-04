"use client";

import { useRef } from 'react';
import { Section } from '@/components/ui/section';
import { useTextAnimations } from '@/hooks/useTextAnimations';

interface BlockHeadingProps {
  tagline?: string | null;
  description?: string | null;
  headline?: string | null;
}

function BlockHeading({ tagline, description, headline }: BlockHeadingProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useTextAnimations(
    sectionRef,
    [
      {
        selector: '.heading-tagline',
        type: 'tagline',
      },
      {
        selector: '.heading-title',
        type: 'headline',
        position: 0.2,
      },
      {
        selector: '.heading-description',
        type: 'description',
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
      id="block-heading"
      fullWidth
      fullHeight
      className="flex flex-col px-4 py-24 items-center justify-center text-pretty"
    >
      <div className="flex h-dvh justify-between flex-col">
        <div>
          {tagline && (
            <p className="heading-tagline text-sm text-gray-500 uppercase tracking-wide">
              {tagline}
            </p>
          )}
          {headline && (
            <h1 className="heading-title text-5xl md:text-5xl lg:text-6xl xl:text-8xl leading-tight tracking-tight text-gray-900">
              {headline}
            </h1>
          )}
        </div>

        <div className="flex justify-center text-left items-left text-pretty md:justify-end">
          {description && (
            <p className="heading-description mt-4 text-lg text-gray-700 max-w-2xl">
              {description}
            </p>
          )}
        </div>
      </div>
    </Section>
  );
}

export default BlockHeading;
export { BlockHeading };
