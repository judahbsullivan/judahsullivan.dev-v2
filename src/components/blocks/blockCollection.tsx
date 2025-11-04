"use client";

import { useRef } from 'react';
import { Section } from '@/components/ui/section';
import { MasonGrid } from '@/components/ui/mason-grid';
import { ParallaxGrid } from '@/components/ui/parallax-grid';
// TODO: Carousel temporarily disabled - planning phase
// import { CarouselGrid } from '@/components/ui/carousel-grid';
import { Table } from '@/components/ui/table';
import { PillLink } from '@/components/ui/pill-link';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitText from 'gsap/SplitText';
import { useTextAnimations } from '@/hooks/useTextAnimations';
import type { BlockCollection as BlockCollectionType } from '@/directus/utils/types';

gsap.registerPlugin(ScrollTrigger, SplitText);

type CardItem = {
  slug?: string | null;
  title?: string | null;
  description?: string | null;
  image?: string | null;
  published_at?: string | null;
};

interface BlockCollectionProps extends BlockCollectionType {
  tagline?: string | null;
  headline?: string | null;
  limit?: number | null;
  collection?: string | null;
  layouts?: 'mason' | 'parallax' | /* 'carousel' | */ 'list' | 'view' | null;
  normalized?: CardItem[];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function BlockCollection({ tagline, headline, limit, collection, layouts, normalized = [] }: BlockCollectionProps) {
  const basePath = (collection === 'projects' || collection === 'project') ? '/projects' : '/blog';
  const label = (collection === 'projects' || collection === 'project') ? 'Project' : 'Post';
  const collectionLayoutsRef = useRef<HTMLDivElement>(null);
  const hoverBtnRef = useRef<HTMLButtonElement | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  // Text animations using modular hook
  useTextAnimations(
    sectionRef,
    [
      {
        selector: '.collection-tagline',
        type: 'tagline',
      },
      {
        selector: '.collection-headline',
        type: 'headline',
      },
    ],
    {
      start: 'top 80%',
      once: true,
    },
    [tagline, headline]
  );

  useGSAP(() => {
    const collectionLayouts = collectionLayoutsRef.current;
    if (!collectionLayouts) return;

    const currentLayout = layouts || null;
    
    // GSAP matchMedia for responsive layout handling
    const mm = gsap.matchMedia();
    
    // Mobile and tablet: Only show mason and parallax
    mm.add('(max-width: 1023px)', () => {
      if (currentLayout === 'list' || currentLayout === 'view') {
        // Force switch to mason on mobile/tablet for table layouts
        const tableElement = collectionLayouts.querySelector('.table-container');
        const masonElement = collectionLayouts.querySelector('.mason-grid');
        
        if (tableElement) {
          gsap.set(tableElement, { display: 'none' });
        }
        
        if (masonElement) {
          gsap.set(masonElement, { display: 'block' });
        }
      }
    });
    
    // Desktop: Show all layouts including table
    mm.add('(min-width: 1024px)', () => {
      // Restore original layout on desktop
      if (currentLayout === 'list' || currentLayout === 'view') {
        const tableElement = collectionLayouts.querySelector('.table-container');
        if (tableElement) {
          gsap.set(tableElement, { display: 'block' });
        }
      }
    });

    // Initialize card animations
    const hoverBtn = document.getElementById('hover-follow-btn') as HTMLButtonElement;
    if (hoverBtn) {
      hoverBtnRef.current = hoverBtn;
    }

    const cards = document.querySelectorAll<HTMLElement>('.collection-card');

    cards.forEach((card) => {
      const titleEl = card.querySelector<HTMLElement>('.card-title');
      const descEl = card.querySelector<HTMLElement>('.card-description');
      const tl = gsap.timeline({
        scrollTrigger: { trigger: card, start: 'top 80%', once: true }
      });

      if (titleEl) {
        const split = new SplitText(titleEl, { type: 'words' });
        tl.from(split.words, { y: 30, opacity: 0, stagger: 0.05, duration: 0.6, ease: 'power3.out' }, 0);
      }
      if (descEl) {
        const split = new SplitText(descEl, { type: 'lines' });
        tl.from(split.lines, { y: 20, opacity: 0, stagger: 0.08, duration: 0.5, ease: 'power3.out' }, 0.2);
      }

      // Only image hover triggers button
      const img = card.querySelector<HTMLElement>('.collection-image');
      if (!img || !hoverBtnRef.current) return;

      const handleMouseEnter = () => {
        const slug = card.dataset.slug ?? '';
        if (hoverBtnRef.current) {
          hoverBtnRef.current.textContent = `View ${slug.split('/').pop()}`;
          gsap.to(hoverBtnRef.current, { scale: 1, opacity: 1, duration: 0.3, ease: 'power2.out' });
        }
      };

      const handleMouseMove = (e: MouseEvent) => {
        if (hoverBtnRef.current) {
          gsap.to(hoverBtnRef.current, { x: e.clientX + 20, y: e.clientY + 20, duration: 0.2, ease: 'power3.out' });
    }
      };

      const handleMouseLeave = () => {
        if (hoverBtnRef.current) {
          gsap.to(hoverBtnRef.current, { scale: 0, opacity: 0, duration: 0.3, ease: 'power3.inOut' });
        }
      };

      img.addEventListener('mouseenter', handleMouseEnter);
      img.addEventListener('mousemove', handleMouseMove);
      img.addEventListener('mouseleave', handleMouseLeave);

      return () => {
        img.removeEventListener('mouseenter', handleMouseEnter);
        img.removeEventListener('mousemove', handleMouseMove);
        img.removeEventListener('mouseleave', handleMouseLeave);
      };
    });

    return () => {
      mm.revert();
      ScrollTrigger.getAll().forEach(trigger => {
        const triggerEl = trigger.vars?.trigger as Element | undefined;
        if (triggerEl && triggerEl instanceof Element && triggerEl.classList?.contains('collection-card')) {
          trigger.kill();
        }
      });
    };
  }, { scope: collectionLayoutsRef, dependencies: [layouts, normalized] });

  return (
    <Section
      ref={sectionRef}
      id="block-collection"
      fullWidth
      className="flex flex-col items-center justify-center gap-24 px-6 py-52 text-pretty"
    >
      {/* Intro */}
      <div className="flex flex-col gap-4">
        {tagline && (
          <p className="collection-tagline text-xl text-gray-500 uppercase tracking-wide">{tagline}</p>
        )}
        {headline && (
          <h4 className="collection-headline text-5xl md:text-[5vw] leading-[.89] uppercase font-light overflow-hidden">
            {headline}
          </h4>
        )}
      </div>

      {/* Layout Components */}
      <div ref={collectionLayoutsRef} id="collection-layouts" data-layout={layouts}>
        {layouts === 'mason' && <MasonGrid posts={normalized} base={(collection === 'projects' || collection === 'project') ? 'project' : 'post'} />}
        {layouts === 'parallax' && <ParallaxGrid posts={normalized} base={(collection === 'projects' || collection === 'project') ? 'project' : 'post'} />}
        {/* TODO: Carousel temporarily disabled - planning phase */}
        {/* {layouts === 'carousel' && <CarouselGrid posts={normalized} base={(collection === 'projects' || collection === 'project') ? 'project' : 'post'} />} */}
        {(layouts === 'list' || layouts === 'view') && (
          <div className="table-container">
            <Table posts={normalized} base={(collection === 'projects' || collection === 'project') ? 'project' : 'post'} />
          </div>
        )}
      </div>

      {/* View All Button */}
      <div className="mt-12">
        <PillLink href={basePath}>
          View All {label}s
        </PillLink>
      </div>
    </Section>
  );
}

export default BlockCollection;
export { BlockCollection };
