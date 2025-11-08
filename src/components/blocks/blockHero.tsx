"use client";

import { useRef } from 'react';
import { Section } from '@/components/ui/section';
import { Headline } from '@/components/ui/headline';
import { PillLink } from '@/components/ui/pill-link';
import type { BlockHero as BlockHeroType } from '@/directus/utils/types';
import { useTextAnimations } from '@/hooks/useTextAnimations';

type BlockHeroProps = Omit<BlockHeroType, 'user_created' | 'user_updated'>;

function BlockHero(props: BlockHeroProps) {
  void props;
  const heroRef = useRef<HTMLElement>(null);

  useTextAnimations(
    heroRef,
    [
      { selector: '.hero-headline', type: 'headline', animateEach: true },
      { selector: '.hero-tagline', type: 'paragraph', animateEach: true },
      { selector: '.hero-name', type: 'name', animateEach: true },
      { selector: '.hero-description', type: 'paragraph', animateEach: true },
      { selector: '.hero-btn', type: 'button', animateEach: true },
    ],
    { start: 'top 90%', once: true, notifyOnComplete: true },
    []
  );
  return (
    <Section
      ref={heroRef}
      id="hero-block"
      fullWidth
      className="relative overflow-hidden"
    >
      <div className="flex w-full px-6 items-center flex-col justify-between h-screen pt-10 pb-6 gap-24 relative z-10">
        <Headline 
          as="h1"
          className="hero-headline overflow-hidden transition-transform  tracking-tighter text-7xl md:text-[10vw] inline-block text-pretty break-keep leading-[.99] uppercase  text-center"
        >
          Creative Systems, Scalable Code
        </Headline>

        <div className="flex gap-2 items-end  w-full flex-col">
          <div className="md:w-1/2">
            <h2 className="hero-tagline text-lg uppercase tracking-wider text-neutral-500 mb-1">
              Software Engineer | Frontend Architect | Digital Craftsman
            </h2>
            <h4 className="hero-name text-4xl md:text-[5vw] uppercase font-light leading-tight tracking-tighter">
              Judah Sullivan
            </h4>
            <p className="hero-description">Located Currently in Houston, TX</p>
            <p className="hero-description">Currently Open To Work! </p>

            <PillLink href="/contact" className="hero-btn mt-4">
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

