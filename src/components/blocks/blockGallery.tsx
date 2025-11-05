"use client";

import { useRef } from 'react';
import { DirectusImage } from '@/components/ui/directus-image';
import { useTextAnimations } from '@/hooks/useTextAnimations';
import type { DirectusFiles } from '@/directus/utils/types';

interface BlockGalleryItems {
  directus_file?: string | DirectusFiles | null;
}

interface BlockGalleryProps {
  tagline?: string | null;
  headline?: string | null;
  items?: BlockGalleryItems[];
}

function BlockGallery({ tagline, headline, items }: BlockGalleryProps) {
  const galleryRef = useRef<HTMLElement>(null);

  useTextAnimations(
    galleryRef,
    [
      {
        selector: '.gallery-tagline',
        type: 'tagline',
      },
      {
        selector: '.gallery-headline',
        type: 'headline',
      },
      {
        selector: '#blockgallery',
        type: 'paragraph',
      },
    ],
    {
      start: 'top 80%',
      once: true,
    },
    [tagline, headline, items]
  );

  return (
    <section ref={galleryRef} className="py-16 px-4 md:px-12 bg-white">
      <div id="blockgallery" className="w-full md:w-1/2 flex flex-col justify-center space-y-6">
        {tagline && <p className="gallery-tagline text-sm text-gray-600 uppercase tracking-wide">{tagline}</p>}
        {headline && <h1 className="gallery-headline text-4xl font-bold text-gray-900">{headline}</h1>}
      </div>
      <div className="pt-12 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 grid gap-6">
        {items?.map((item, index) => {
          const imageId = typeof item.directus_file === 'string' 
            ? item.directus_file 
            : item.directus_file?.id;
          
          if (!imageId) return null;
          
          return (
            <DirectusImage
              key={index}
              imageId={imageId}
            />
          );
        })}
      </div>
    </section>
  );
}

export default BlockGallery;
export { BlockGallery };
