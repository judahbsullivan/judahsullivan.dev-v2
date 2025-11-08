"use client";

import { useRef } from 'react';
import { Section } from '@/components/ui/section';
import { Headline } from '@/components/ui/headline';
import { PillLink } from '@/components/ui/pill-link';
import { useTextAnimations } from '@/hooks/useTextAnimations';
import type { BlockHero as BlockHeroType, BlockButton } from '@/directus/utils/types';

type BlockHeroProps = Omit<BlockHeroType, 'user_created' | 'user_updated'>;

function BlockHero({
  tagline,
  headline,
  description,
  button_group,
}: BlockHeroProps) {
  const buttons: BlockButton[] = button_group && Array.isArray(button_group.buttons)
    ? (button_group.buttons as BlockButton[])
    : [];

  const heroBlockRef = useRef<HTMLElement>(null);

  useTextAnimations(
    heroBlockRef,
    [
      {
        selector: '.hero-headline',
        type: 'headline',
        animateEach: true,
      },
      {
        selector: '.hero-tagline',
        type: 'paragraph',
        animateEach: true,
      },
      {
        selector: '.hero-description',
        type: 'paragraph',
        animateEach: true,
      },
    ],
    {
      start: 'top 90%',
      once: true,
    },
    [tagline, headline, description]
  );


  return (
    <Section
      ref={heroBlockRef}
      id="hero-block"
      fullWidth
      className="relative overflow-hidden"
    >
      <div className="flex w-full px-6 items-center flex-col justify-between h-screen pb-18 gap-12 relative z-10">
        {headline && (
          <Headline
            as="h1"
            className="hero-headline overflow-hidden transition-transform tracking-tighter text-7xl md:text-[10vw] inline-block text-pretty break-keep leading-[.99] uppercase text-center"
          >
            {headline}
          </Headline>
        )}

        <div className="flex gap-2 items-end w-full flex-col">
          <div className="md:w-1/2">
            {tagline && (
              <h2 className="hero-tagline text-lg uppercase tracking-wider text-neutral-600 mb-1">
                {tagline}
              </h2>
            )}
            {description && (
              <p className="hero-description">{description}</p>
            )}

            {buttons.length > 0 && (
              <div className="flex flex-wrap gap-4 mt-4">
                {buttons.map((button) => {
                  const pagePermalink = typeof button.page === 'object' && button.page !== null && 'permalink' in button.page 
                    ? (button.page as { permalink: string }).permalink 
                    : null;
                  const postSlug = typeof button.post === 'object' && button.post !== null && 'slug' in button.post
                    ? (button.post as { slug: string }).slug
                    : null;
                  const href =
                    button.url ||
                    pagePermalink ||
                    (postSlug ? `/post/${postSlug}` : null) ||
                    '#';
                  const label = button.label || 'Button';

                  return (
                    <PillLink
                      key={button.id}
                      href={href}
                      className="hero-btn"
                      target={href?.startsWith('http') ? '_blank' : undefined}
                      rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                    >
                      {label}
                    </PillLink>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </Section>
  );
}

export default BlockHero;
export { BlockHero };

