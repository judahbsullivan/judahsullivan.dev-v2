"use client";

import { useRef, useEffect } from 'react';
import { Link } from './link';
import { DirectusImage } from './directus-image';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Section } from './section';

gsap.registerPlugin(ScrollTrigger);

type CardItem = {
  slug?: string | null;
  title?: string | null;
  description?: string | null;
  image?: string | null;
  published_at?: string | null;
};

interface TableProps {
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

export function Table({ posts, className, base = 'post' }: TableProps) {
  const tableRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Kill any existing ScrollTriggers for this component to prevent conflicts
    ScrollTrigger.getAll().forEach((trigger) => {
      if (trigger.vars.id && typeof trigger.vars.id === 'string' && trigger.vars.id.startsWith("table-row-")) {
        trigger.kill();
      }
    });

    const rows = tableRef.current?.querySelectorAll('#posts-table-wrap .post-row');
    if (!rows || !rows.length) return;

    // Animate from CSS initial state (opacity: 0, transform: translateY(10px))
    gsap.to(rows, {
      y: 0,
      opacity: 1,
      duration: 0.35,
      ease: 'power2.out',
      stagger: 0.03,
      scrollTrigger: {
        id: 'table-rows-intro',
        trigger: tableRef.current,
        start: 'top 80%',
        once: true,
      },
    });
  }, { scope: tableRef, dependencies: [posts] });

  useEffect(() => {
    const tableWrap = document.getElementById('posts-table-wrap');
    const preview = document.getElementById('post-preview');
    const slider = document.getElementById('post-preview-slider');
    const frame = document.getElementById('post-preview-frame');

    if (!tableWrap || !preview || !slider || !frame) return;

    // Guard to avoid double-binding
    if ((tableWrap as HTMLElement & { _previewBound?: boolean })._previewBound) return;
    (tableWrap as HTMLElement & { _previewBound?: boolean })._previewBound = true;

    const rows = tableWrap.querySelectorAll('.post-row');
    let activeIndex = 0;

    const showPreview = () => {
      preview.classList.remove('scale-0', 'opacity-0');
      preview.classList.add('scale-100', 'opacity-100');
    };

    const hidePreview = () => {
      preview.classList.add('scale-0', 'opacity-0');
      preview.classList.remove('scale-100', 'opacity-100');
    };

    const updateIndex = (index: number) => {
      const h = (frame as HTMLElement).clientHeight;
      const countAttr = slider.getAttribute('data-count');
      const count = Number(countAttr) || 0;
      const reversedIndex = Math.max(0, count - 1 - index);
      const offset = -(reversedIndex * h);
      (slider as HTMLElement).style.transform = `translateY(${offset}px)`;
    };

    const handleRowMouseEnter = (e: Event) => {
      const target = e.currentTarget as HTMLElement | null;
      if (!target) return;
      const indexAttr = target.getAttribute('data-index');
      const idx = Number(indexAttr) || 0;
      activeIndex = idx;
      updateIndex(activeIndex);
      showPreview();
    };

    const handleTableMouseEnter = () => {
      updateIndex(activeIndex);
      showPreview();
    };

    const handleTableMouseLeave = () => hidePreview();

    const handleTableMouseMove = (e: MouseEvent) => {
      const rect = tableWrap.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const offsetX = 14;
      const offsetY = -10;
      (preview as HTMLElement).style.left = `${x + offsetX}px`;
      (preview as HTMLElement).style.top = `${y + offsetY}px`;
    };

    rows.forEach((row) => {
      row.addEventListener('mouseenter', handleRowMouseEnter);
    });

    tableWrap.addEventListener('mouseenter', handleTableMouseEnter);
    tableWrap.addEventListener('mouseleave', handleTableMouseLeave);
    tableWrap.addEventListener('mousemove', handleTableMouseMove);

    return () => {
      rows.forEach((row) => {
        row.removeEventListener('mouseenter', handleRowMouseEnter);
      });
      tableWrap.removeEventListener('mouseenter', handleTableMouseEnter);
      tableWrap.removeEventListener('mouseleave', handleTableMouseLeave);
      tableWrap.removeEventListener('mousemove', handleTableMouseMove);
      (tableWrap as HTMLElement & { _previewBound?: boolean })._previewBound = false;
    };
  }, [posts]);

  return (
    <Section ref={tableRef} className={`w-full overflow-visible ${className || ''}`}>
      <div id="posts-table-wrap" className="relative divide-y divide-gray-200 border-t border-gray-200">
        {posts.map((post, index) => (
          <Link
            key={post.slug || index}
            href={`/${base}/${post.slug}`}
            className="post-row group relative flex items-baseline justify-between gap-6 py-5"
            data-index={index}
            aria-label={post.title ? `Read ${post.title}` : `Read ${base} ${index + 1}`}
          >
            <div className="min-w-0">
              <h3 className="truncate text-base font-medium tracking-tight text-gray-900 group-hover:text-blue-600 transition-colors">
                {post.title}
              </h3>
              {getSummary(post) && (
                <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                  {getSummary(post)}
                </p>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-4 text-sm">
              {post.published_at && (
                <span className="text-gray-500">
                  {new Date(post.published_at).toLocaleDateString()}
                </span>
              )}
              <span className="text-gray-400 group-hover:text-gray-800 transition-colors">→</span>
            </div>
          </Link>
        ))}

        <div id="post-preview" className="pointer-events-none absolute origin-top-left scale-0 opacity-0 transition-all duration-300 ease-out" style={{ left: '100%', top: '50%' }}>
          <div id="post-preview-frame" className="h-56 w-64 overflow-hidden rounded-lg shadow-xl ring-1 ring-black/5 bg-white ">
            <div id="post-preview-slider" data-count={posts.length} className="relative transition-transform duration-500 ease-out flex flex-col-reverse">
              {posts.map((post, index) => (
                <div key={post.slug || `preview-${index}`} className=" flex items-center justify-center px-4 h-56 w-64">
                  {post.image && (
                    <DirectusImage
                      imageId={post.image}
                      alt={post.title || 'Preview image'}
                      className="h-full w-full aspect-video object-cover mx-auto"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

