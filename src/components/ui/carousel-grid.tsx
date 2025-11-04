"use client";

// TODO: Carousel temporarily disabled - planning phase
// This component is commented out but kept for future implementation

import { useRef } from 'react';
import Image from 'next/image';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

type CardItem = {
  slug?: string | null;
  title?: string | null;
  description?: string | null;
  image?: string | null;
  published_at?: string | null;
};

interface CarouselGridProps extends React.HTMLAttributes<HTMLDivElement> {
  posts: CardItem[];
  base?: 'post' | 'project';
}

export function CarouselGrid({
  posts,
  base = 'post',
  className,
  ...rest
}: CarouselGridProps) {
  const carouselRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Kill any existing ScrollTriggers for this component to prevent conflicts
    ScrollTrigger.getAll().forEach(trigger => {
      if (trigger.vars.id && typeof trigger.vars.id === 'string' && trigger.vars.id.startsWith('carousel-')) {
        trigger.kill();
      }
    });

    const carouselItems = carouselRef.current?.querySelectorAll('.carousel-item');
    if (!carouselItems) return;

    carouselItems.forEach((item, index) => {
      const image = item.querySelector('.carousel-image');
      
      if (!image) return;

      // Set initial state
      gsap.set(image, { 
        scale: 1.1, 
        opacity: 0.8 
      });

      // Animate image on scroll
      gsap.to(image, {
        scale: 1,
        opacity: 1,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          id: `carousel-image-${index}`,
          trigger: item,
          start: "top 80%",
          end: "bottom 20%",
          scrub: false,
        }
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.vars.id && typeof trigger.vars.id === 'string' && trigger.vars.id.startsWith('carousel-')) {
          trigger.kill();
        }
      });
    };
  }, { scope: carouselRef, dependencies: [posts] });

  return (
    <div ref={carouselRef} className={`w-full relative overflow-hidden ${className || ''}`} {...rest}>
      <div className="carousel-track flex items-end justify-center">
        {posts.map((item, index) => (
          <CarouselItem
            key={`item-${index}`}
            item={item}
            index={index}
            base={base}
          />
        ))}
        
        {/* Duplicate items for seamless loop */}
        {posts.map((item, index) => (
          <CarouselItem
            key={`duplicate-${index}`}
            item={item}
            index={index}
            base={base}
            isDuplicate={true}
          />
        ))}
      </div>
    </div>
  );
}

function CarouselItem({
  item,
  index,
  base,
  isDuplicate = false,
}: {
  item: CardItem;
  index: number;
  base: 'post' | 'project';
  isDuplicate?: boolean;
}) {
  const imageSrc = item.image?.startsWith('http') 
    ? item.image 
    : item.image 
      ? `${process.env.NEXT_PUBLIC_DIRECTUS_API_URL}assets/${item.image}` 
      : null;

  const width = 300 + (index % 4) * 50;
  const aspectRatio = 1.2 + (index % 4) * 0.2;

  return (
    <div
      className="carousel-item shrink-0 mx-4"
      style={{ width: '400px' }}
      data-index={isDuplicate ? `duplicate-${index}` : index}
    >
      <div className="bg-gray-100 relative overflow-hidden rounded-lg">
        {imageSrc && (
          <Image
            src={imageSrc}
            alt={item.title || `${base} image`}
            className="carousel-image w-full h-full object-cover transition-transform duration-300 ease-in-out hover:scale-105"
            width={width}
            height={Math.round(width / aspectRatio)}
            style={{
              aspectRatio: `${aspectRatio}`,
            }}
            loading="lazy"
            unoptimized={imageSrc.startsWith('http') || imageSrc.includes('directus')}
          />
        )}
      </div>
    </div>
  );
}

