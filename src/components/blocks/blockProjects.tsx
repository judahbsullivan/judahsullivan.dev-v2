"use client";

import { useRef } from 'react';
import { Section } from '@/components/ui/section';
import { Button } from '@/components/ui/button';
import { DirectusImage } from '@/components/ui/directus-image';
import { PillLink } from '@/components/ui/pill-link';
import { ItemList } from '@/components/ui/item-list';
import { ItemCard } from '@/components/ui/item-card';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import SplitText from 'gsap/SplitText';
import type { BlockCollection as BlockCollectionType, Projects } from '@/directus/utils/types';

gsap.registerPlugin(SplitText);

interface BlockProjectsProps extends BlockCollectionType {
  headline?: string | null;
  tagline?: string | null;
  limit?: number | null;
  collection?: string | null;
  projects?: Projects[];
}

function BlockProjects({ headline, tagline, limit, collection, projects = [] }: BlockProjectsProps) {
  const blockRef = useRef<HTMLElement>(null);

  // Helper to extract image ID from cover_image which can be string or DirectusFiles object
  const getImageId = (coverImage: Projects['cover_image']): string | null => {
    if (!coverImage) return null;
    if (typeof coverImage === 'string') return coverImage;
    // Type assertion needed due to Directus type intersection (string & DirectusFiles)
    const imageObj = coverImage as unknown as { id?: string };
    return imageObj?.id && typeof imageObj.id === 'string' ? imageObj.id : null;
  };

  useGSAP(() => {
    const block = blockRef.current;
    if (!block) return;

    // Text wrappers (spans with translate-y-full)
    const taglineEls = block.querySelectorAll<HTMLElement>("p span.uppercase");
    const headlineEls = block.querySelectorAll<HTMLElement>("h2 span");

    // Buttons
    const filterBtns = block.querySelectorAll<HTMLButtonElement>(".flex.flex-wrap button");
    const viewBtns = block.querySelectorAll<HTMLButtonElement>(".flex.items-center button");

    // List/Card item wrappers (inline-block translate-y-full)
    const items = block.querySelectorAll<HTMLElement>("div.overflow-hidden > div.inline-block.translate-y-full");

    // View more wrapper
    const viewMoreWrapper = block.querySelector<HTMLElement>(".flex.justify-center.pt-8.overflow-hidden > div.inline-block");

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.3 });

    // Tagline: split into words and animate up by 50%
    if (taglineEls.length) {
      const split = new SplitText(taglineEls, { type: 'words' });
      tl.to(
        split.words,
        { translateY: '-50%', stagger: 0.1, duration: 0.6 },
        0.2
      );
    }

    // Headline: split into words and animate up by 100%
    if (headlineEls.length) {
      const split = new SplitText(headlineEls, { type: 'words' });
      tl.to(
        split.words,
        { translateY: '-100%', stagger: 0.1, duration: 0.8 },
        0
      );
    }

    // Filter buttons pop in
    if (filterBtns.length) {
      tl.to(
        filterBtns,
        { scale: 1, opacity: 1, stagger: 0.05, duration: 0.5 },
        0.8
      );
    }

    // View mode buttons pop in
    if (viewBtns.length) {
      tl.to(
        viewBtns,
        { scale: 1, opacity: 1, stagger: 0.05, duration: 0.5 },
        0.8
      );
    }

    // Items slide up into place
    if (items.length) {
      tl.to(
        items,
        { translateY: '0%', stagger: 0.1, duration: 0.8 },
        1.0
      );
    }

    // "View more" button scales in
    if (viewMoreWrapper) {
      tl.to(
        viewMoreWrapper,
        { scale: 1, opacity: 1, duration: 0.5 },
        1.2
      );
    }
  }, { scope: blockRef, dependencies: [projects, limit] });

  return (
    <Section ref={blockRef} fullWidth className="block-projects py-24 px-4 md:px-16 space-y-16">
      {/* Headline */}
      <div className="space-y-4 overflow-hidden">
        {tagline && (
          <p>
            <span className="uppercase text-sm text-gray-500 tracking-widest inline-block transition-transform translate-y-full">
              {tagline}
            </span>
          </p>
        )}
        {headline && (
          <h2 className="overflow-hidden">
            <span className="text-5xl md:text-5xl lg:text-6xl xl:text-8xl leading-tight tracking-tight text-gray-900 inline-block transition-transform translate-y-full">
              {headline}
            </span>
          </h2>
        )}
      </div>

      <hr />

      {/* Filters & View Mode Buttons */}
      <div className="flex justify-between items-center mt-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <Button size="sm" className="inline-block scale-0 transition-transform">All</Button>
          <Button size="sm" className="inline-block scale-0 transition-transform">Design</Button>
          <Button size="sm" className="inline-block scale-0 transition-transform">Development</Button>
        </div>
        <div className="hidden md:flex items-center gap-4 shrink-0">
          <Button size="sm" className="inline-block scale-0 transition-transform">List</Button>
          <Button size="sm" className="inline-block scale-0 transition-transform">Card</Button>
        </div>
      </div>

      {/* List View with shared hover preview (desktop only) */}
      <div id="projects-list" className="hidden md:block mt-24 divide-y border-t w-full relative">
        {projects.slice(0, Number(limit)).map((proj, idx) => (
          <div key={proj.id || idx} className="overflow-hidden">
            <div className="project-row inline-block w-full translate-y-full transition-transform py-5" data-index={idx}>
              <ItemList id={proj.id?.toString()} slug={proj.slug || null} title={proj.title || null} description={proj.description || null} />
            </div>
          </div>
        ))}

        {/* Shared hover preview container */}
        <div id="project-preview" className="pointer-events-none absolute origin-top-left scale-0 opacity-0 transition-all duration-300 ease-out" style={{ left: '100%', top: '50%' }}>
          <div id="project-preview-frame" className="h-36 w-56 overflow-hidden rounded-lg shadow-xl ring-1 ring-black/5 bg-white">
            <div id="project-preview-slider" data-count={projects.length} className="relative transition-transform duration-500 ease-out flex flex-col-reverse">
              {projects.map((p) => (
                <div key={p.id} className="h-36 w-56">
                  {p.cover_image && getImageId(p.cover_image) && (
                    <DirectusImage 
                      imageId={getImageId(p.cover_image)!} 
                      alt={p.title || 'Preview image'} 
                      className="h-full w-full object-cover" 
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Card View (always on mobile) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
        {projects.slice(0, Number(limit)).map((project) => (
          <div key={project.id} className="overflow-hidden">
            <div className="inline-block translate-y-full transition-transform w-full">
              <ItemCard 
                slug={project.slug || null}
                title={project.title || null}
                description={project.description || null}
                image={getImageId(project.cover_image)}
                published_at={project.date_created || null}
              />
            </div>
          </div>
        ))}
      </div>

      {/* View All Button */}
      <div className="flex justify-center pt-8 overflow-hidden">
        <div className="inline-block scale-0 transition-transform">
          <PillLink href={`/${collection}`}>
            View more {collection}
          </PillLink>
        </div>
      </div>
    </Section>
  );
}

export default BlockProjects;
export { BlockProjects };
