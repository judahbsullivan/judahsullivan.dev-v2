"use client";

import { useRef } from 'react';
import { Section } from '@/components/ui/section';
import { Headline } from '@/components/ui/headline';
import { PillLink } from '@/components/ui/pill-link';
import { useTextAnimations } from '@/hooks/useTextAnimations';
import type { BlockButton, BlockHero as BlockHeroType } from '@/directus/utils/types';

interface BlockHeroProps extends Omit<BlockHeroType, 'user_created' | 'user_updated'> {}

function BlockHero({
  tagline,
  headline,
  description,
  button_group,
  image,
}: BlockHeroProps) {
  const buttons: BlockButton[] = Array.isArray(button_group && button_group.buttons)
    ? (button_group!.buttons as BlockButton[])
    : [];

  const heroBlockRef = useRef<HTMLElement>(null);

  useTextAnimations(
    heroBlockRef,
    [
      {
        selector: '.hero-headline',
        type: 'headline',
      },
      {
        selector: '.hero-tagline',
        type: 'tagline',
        position: '-=0.4',
      },
      {
        selector: '.hero-description',
        type: 'description',
        position: '-=0.25',
      },
      {
        selector: '.hero-name',
        type: 'name',
        position: '-=0.25',
      },
      {
        selector: '.hero-btn',
        type: 'button',
        position: '-=0.25',
      },
      {
        selector: '.hero-image',
        type: 'image',
        position: '-=0.25',
      },
    ],
    {
      start: 'top 90%',
      once: true,
    },
    [tagline, headline, description, buttons]
  );

  return (
    <Section
      ref={heroBlockRef}
      id="hero-block"
      fullWidth
      className="relative overflow-hidden"
    >
      <div className="flex w-full px-6 items-center flex-col justify-between h-screen pt-10 pb-6 gap-24 relative z-10">
        <Headline
          as="h1"
          className="hero-headline overflow-hidden transition-transform tracking-tighter text-7xl md:text-[10vw] inline-block text-pretty break-keep leading-[.99] uppercase text-center"
        >
          Creative Systems, Scalable Code
        </Headline>

        <div className="flex gap-2 items-end w-full flex-col">
          <div className="md:w-1/2">
            <h2 className="hero-tagline text-lg uppercase tracking-wider text-neutral-600 mb-1">
              Software Engineer | Frontend Architect | Digital Craftsman
            </h2>
            <h3 className="hero-name text-4xl md:text-[5vw] uppercase font-light leading-tight tracking-tighter">
              Judah Sullivan
            </h3>
            <p className="hero-description">Located Currently in Houston, TX</p>
            <p className="hero-description">Currently Open To Work!</p>

            <PillLink href="/contact" className="mt-4">
              Lets Connect
            </PillLink>
          </div>
        </div>
      </div>
    </Section>
  );
}

export default BlockHero;
export { BlockHero };

