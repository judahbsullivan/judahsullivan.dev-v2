"use client";

import { useRef } from 'react';
import { DirectusImage } from './directus-image';
import { Link } from './link';
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

interface MasonGridProps {
  posts: CardItem[];
  className?: string;
  base?: 'post' | 'project';
}

function getSummary(post: CardItem): string {
  const raw = (post.description || '') as string;
  if (!raw) return '';
  const text = raw.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return text;
}

export function MasonGrid({ posts, className, base = 'post' }: MasonGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Kill any existing ScrollTriggers for this component to prevent conflicts
    ScrollTrigger.getAll().forEach((trigger) => {
      if (trigger.vars.id && typeof trigger.vars.id === 'string' && trigger.vars.id.startsWith("mason-")) {
        trigger.kill();
      }
    });

    const masonItems = gridRef.current?.querySelectorAll(".mason-item");
    if (!masonItems || masonItems.length === 0) return;

    // Animate items in with stagger
    // Starting state is set in CSS/Tailwind (opacity-0 translate-y-4)
    gsap.to(masonItems, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: "power3.out",
      scrollTrigger: {
        id: "mason-grid",
        trigger: gridRef.current,
        start: "top 80%",
        once: true,
      },
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.vars.id && typeof trigger.vars.id === 'string' && trigger.vars.id.startsWith("mason-")) {
          trigger.kill();
        }
      });
    };
  }, { scope: gridRef, dependencies: [posts] });

  return (
    <div ref={gridRef} className={`mason-grid w-full ${className || ''}`}>
        <div className="columns-1 sm:columns-2 lg:columns-3" style={{ columnGap: '1rem' }}>
          {posts.map((post) => (
            <div key={post.slug || Math.random()} className="mason-item opacity-0 translate-y-4 mb-6 break-inside-avoid rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
              <Link 
                href={`/${base}/${post.slug}`} 
                className="group block relative"
                aria-label={post.title ? `Read ${post.title}` : `Read ${base}`}
              >
                {post.image && (
                  <div className="relative">
                    {post.image.startsWith('http') ? (
                      <Image
                        src={post.image}
                        alt={post.title || 'Post image'}
                        className="w-full h-auto block object-cover transition-transform duration-300 group-hover:scale-[1.01]"
                        width={600}
                        height={400}
                        loading="lazy"
                      />
                    ) : (
                      <DirectusImage
                        imageId={post.image}
                        alt={post.title || 'Post image'}
                        className="w-full h-auto block object-cover transition-transform duration-300 group-hover:scale-[1.01]"
                      />
                    )}
                    <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center">
                      <div className="read-more-bubble">
                        <span className="text-[11px] font-medium tracking-wide uppercase">Read more</span>
                      </div>
                    </div>
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-semibold tracking-tight text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {post.title}
                  </h3>
                  {getSummary(post) && (
                    <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                      {post.description}
                    </p>
                  )}
                  {post.published_at && (
                    <div className="text-xs text-gray-500">
                      {new Date(post.published_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
  );
}

