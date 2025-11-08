"use client";

import { useRef } from 'react';
import { Section } from '@/components/ui/section';
import { MasonGrid } from '@/components/ui/mason-grid';
import { Table } from '@/components/ui/table';
import { ParallaxGrid } from '@/components/ui/parallax-grid';
// TODO: Carousel temporarily disabled - planning phase
// import { CarouselGrid } from '@/components/ui/carousel-grid';
import { Icon } from '@/components/ui/icon';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Flip } from 'gsap/Flip';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitText from 'gsap/SplitText';
import { useTextAnimations } from '@/hooks/useTextAnimations';
import type { BlockPosts as BlockPostsType } from '@/directus/utils/types';

gsap.registerPlugin(Flip, ScrollTrigger, SplitText);

type CardItem = {
  slug?: string | null;
  title?: string | null;
  description?: string | null;
  image?: string | null;
  published_at?: string | null;
};

interface BlockPostsProps extends BlockPostsType {
  headline?: string | null;
  tagline?: string | null;
  limit?: number | null;
  collection?: string | null;
  layouts?: 'mason' | 'parallax' | /* 'carousel' | */ 'table' | null;
  normalized?: CardItem[];
}

function BlockPosts({ headline, tagline, collection, layouts, normalized: initialNormalized }: BlockPostsProps) {
  // Use layouts prop for initial render (server-side), fallback to 'mason'
  // This ensures server and client render the same initially
  // TODO: Carousel temporarily disabled - planning phase
  const defaultLayout = layouts || 'mason';
  const [currentLayout, setCurrentLayout] = useState<string>(defaultLayout);
  const [normalized] = useState<CardItem[]>(initialNormalized || []);
  const [isBlogOrProjectsPage, setIsBlogOrProjectsPage] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const pathname = usePathname();
  const postsBlockRef = useRef<HTMLElement>(null);
  const postsContainerRef = useRef<HTMLDivElement>(null);
  const postsTableRef = useRef<HTMLDivElement>(null);
  const postsParallaxRef = useRef<HTMLDivElement>(null);
  // TODO: Carousel temporarily disabled - planning phase
  // const postsCarouselRef = useRef<HTMLDivElement>(null);
  const layoutWrapperRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<gsap.core.Timeline | null>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Only check pathname on client after mount to avoid hydration mismatch
  useEffect(() => {
    const currentPath = pathname || '/';
    const isBlogOrProjects = currentPath === '/blog' || currentPath === '/blog/' || currentPath === '/projects' || currentPath === '/projects/';
    
    // Defer state updates to avoid cascading renders
    requestAnimationFrame(() => {
      setIsBlogOrProjectsPage(isBlogOrProjects);
      if (isBlogOrProjects) {
        setCurrentLayout('mason');
      }
    });
  }, [pathname]);

  // Text animations using modular hook
  useTextAnimations(
    postsBlockRef,
    [
      {
        selector: '.posts-headline',
        type: 'headline',
      },
      ...(tagline ? [{
        selector: '.posts-tagline',
        type: 'tagline' as const,
      }] : []),
    ],
    {
      start: 'top 80%',
      once: true,
    },
    [headline, tagline]
  );

  // Animation for tabs and content - sequenced after title
  useGSAP(() => {
    if (!postsBlockRef.current) return;

    const tabs = tabsRef.current;
    const content = contentRef.current;

    // Set initial state
    if (tabs) {
      gsap.set(tabs, { opacity: 0 });
    }
    if (content) {
      gsap.set(content, { opacity: 0 });
    }

    // Create timeline with ScrollTrigger
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: postsBlockRef.current,
        start: 'top 80%',
        once: true,
      },
    });

    // Animate tabs after title animation starts (delay to allow title to start animating)
    if (tabs) {
      tl.to(tabs, {
        opacity: 1,
        duration: 0.6,
        ease: 'power2.out',
      }, '+=0.4'); // Start 0.4s after trigger (title has been animating)
    }

    // Animate content after tabs animation completes
    if (content) {
      tl.to(content, {
        opacity: 1,
        duration: 0.6,
        ease: 'power2.out',
      }, '+=0.3'); // Start 0.3s after tabs animation completes
    }
  }, { scope: postsBlockRef, dependencies: [isBlogOrProjectsPage] });

  // GSAP animation for initial layout setup - only runs after hydration
  useGSAP(() => {
    // Set initial state for layout elements
    const layoutElements = {
      mason: postsContainerRef.current,
      table: postsTableRef.current,
      parallax: postsParallaxRef.current,
      // TODO: Carousel temporarily disabled - planning phase
      // carousel: postsCarouselRef.current
    };

    Object.entries(layoutElements).forEach(([key, element]) => {
      if (element) {
        if (key === currentLayout) {
          gsap.set(element, { 
            opacity: 1, 
            visibility: 'visible',
            clearProps: "transform,scale"
          });
        } else {
          gsap.set(element, { 
            opacity: 0, 
            visibility: 'hidden',
            clearProps: "transform,scale"
          });
        }
      }
    });

    // Update button states
    const layoutButtons = document.querySelectorAll('.layouts-btn');
    layoutButtons.forEach(btn => {
      const btnLayout = btn.getAttribute('data-layouts');
      if (btnLayout === currentLayout) {
        btn.classList.add('active', 'bg-white', 'text-gray-900', 'shadow-sm');
        btn.classList.remove('text-gray-600');
      } else {
        btn.classList.remove('active', 'bg-white', 'text-gray-900', 'shadow-sm');
        btn.classList.add('text-gray-600');
      }
    });
  }, { scope: postsBlockRef, dependencies: [currentLayout] });

  const base = collection === 'projects' ? 'project' : 'post';

  const isDesktop = () => {
    if (typeof window === 'undefined') return true;
    return window.innerWidth >= 1024;
  };

  const handleLayoutChange = (layout: string) => {
    // TODO: Carousel temporarily disabled - planning phase
    if (layout === 'carousel') {
      return;
    }

    // Prevent switching to table on mobile/tablet
    if (!isDesktop() && layout === 'table') {
      return;
    }

    // Don't switch to same layout or if already transitioning
    if (layout === currentLayout || isTransitioning) return;

    // Kill any active animation
    if (animationRef.current && animationRef.current.isActive()) {
      animationRef.current.kill();
    }

    setIsTransitioning(true);
    const oldLayout = currentLayout;
    
    // Store current scroll position BEFORE any changes
    const currentScrollY = window.scrollY;
    const wrapper = layoutWrapperRef.current;
    if (!wrapper) {
      setIsTransitioning(false);
      return;
    }
    
    const wrapperRect = wrapper.getBoundingClientRect();
    // Store the distance from viewport top to wrapper top
    const viewportToWrapperBefore = wrapperRect.top;

    const layoutElements = {
      mason: postsContainerRef.current,
      table: postsTableRef.current,
      parallax: postsParallaxRef.current,
      // TODO: Carousel temporarily disabled - planning phase
      // carousel: postsCarouselRef.current
    };

    const oldElement = layoutElements[oldLayout as keyof typeof layoutElements];
    const newElement = layoutElements[layout as keyof typeof layoutElements];

    if (!oldElement || !newElement) {
      setIsTransitioning(false);
      return;
    }

    // Prevent scroll during transition - use a simpler approach
    const originalScrollY = window.scrollY;
    const scrollLock = () => {
      if (window.scrollY !== originalScrollY) {
        window.scrollTo(0, originalScrollY);
      }
    };
    
    // Lock scroll position during transition
    const scrollLockInterval = setInterval(scrollLock, 10);

    // Step 1: Record the FIRST state (current positions) BEFORE making changes
    const state = Flip.getState(oldElement, { props: "opacity,visibility" });

    // Create timeline for smooth sequential transition
    const tl = gsap.timeline({
      onComplete: () => {
        // Remove scroll lock
        clearInterval(scrollLockInterval);
        
        setIsTransitioning(false);
        
        // Update button states
        const layoutButtons = document.querySelectorAll('.layouts-btn');
        layoutButtons.forEach(btn => {
          const btnLayout = btn.getAttribute('data-layouts');
          if (btnLayout === layout) {
            btn.classList.add('active', 'bg-white', 'text-gray-900', 'shadow-sm');
            btn.classList.remove('text-gray-600');
          } else {
            btn.classList.remove('active', 'bg-white', 'text-gray-900', 'shadow-sm');
            btn.classList.add('text-gray-600');
          }
        });
      }
    });

    animationRef.current = tl;

    // Step 2: Fade out old element completely
    tl.to(oldElement, {
      opacity: 0,
      duration: 0.2,
      ease: "power2.in",
      onComplete: () => {
        // Step 3: Hide old element completely BEFORE showing new one
        gsap.set(oldElement, { 
          display: 'none', 
          visibility: 'hidden',
          clearProps: "transform,scale,opacity"
        });
      }
    });

    // Step 4: Update state and prepare new element (completely hidden)
    tl.call(() => {
    setCurrentLayout(layout);
      
      // Show new element but keep it COMPLETELY invisible and hidden initially
      // Use both opacity AND visibility hidden to prevent any flicker
      // Display is handled by CSS class, but we override with GSAP for FLIP
      gsap.set(newElement, { 
        display: 'block', 
        opacity: 0, 
        visibility: 'hidden', // Critical: hidden to prevent flicker
        scale: 0.98 // Subtle scale for smooth transition
      });
      
      // Update CSS classes for consistency
      newElement.classList.remove('hidden');
      newElement.classList.add('block');
      oldElement.classList.remove('block');
      oldElement.classList.add('hidden');
    });

    // Small delay to ensure DOM updates and new element is rendered
    tl.call(() => {
      // Force reflow to ensure new element is in DOM
      void newElement.offsetHeight;

      // Step 5: Use FLIP to animate smoothly from old position to new
      Flip.from(state, {
        targets: newElement,
        duration: 0.4,
        ease: "power2.out",
        absolute: false,
        scale: true,
        onStart: () => {
          // Make visible ONLY when animation starts (prevents flicker)
          gsap.set(newElement, { 
            opacity: 1,
            visibility: 'visible'
          });
        },
        onComplete: () => {
          // Restore scroll position based on viewport-to-wrapper distance
          const wrapperRectAfter = wrapper.getBoundingClientRect();
          const viewportToWrapperAfter = wrapperRectAfter.top;
          const viewportDiff = viewportToWrapperAfter - viewportToWrapperBefore;
          
          // Adjust scroll to maintain the same viewport position relative to wrapper
          if (Math.abs(viewportDiff) > 1) {
            const targetScrollY = currentScrollY + viewportDiff;
            requestAnimationFrame(() => {
              window.scrollTo({
                top: Math.max(0, targetScrollY),
                behavior: 'auto'
              });
            });
          }

          // Clean up transforms
          gsap.set(newElement, { clearProps: "transform,scale" });
        }
      });
    }, undefined, "+=0.05"); // Small delay to ensure DOM is ready
  };

  return (
    <Section ref={postsBlockRef} id="posts-block" fullWidth className="relative overflow-hidden" data-initial-layout={defaultLayout}>
      {/* Hero Section */}
      <div className="flex w-full px-6 items-center flex-col justify-between pt-10 pb-6 gap-24 relative z-10">
        <h1 className="posts-headline overflow-hidden transition-transform tracking-tighter text-7xl md:text-[10vw] inline-block text-pretty break-keep leading-[.99] uppercase text-center">
          {headline || "Latest Posts"}
        </h1>
      </div>

      {/* Controls Section - Only show on blog/projects pages */}
      {isBlogOrProjectsPage && (
        <div ref={tabsRef} className="px-6 py-12 w-full">
          <div className="max-w-7xl mx-auto">
            {/* layouts Toggle */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div className="text-sm text-gray-600">
                <span id="post-count">{normalized?.length || 0}</span> items found
              </div>
              <div className="flex items-center gap-2 bg-gray-200 rounded-lg p-1 overflow-x-auto">
                <button
                  onClick={() => handleLayoutChange('mason')}
                  disabled={isTransitioning}
                  className={`layouts-btn px-3 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${currentLayout === 'mason' ? 'active bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'} ${isTransitioning ? 'opacity-50 cursor-not-allowed' : ''}`}
                  data-layouts="mason"
                  title="Grid Layout"
                  aria-label="Switch to grid layout"
                >
                  <Icon name="grid-3x3" size={16} aria-hidden="true" />
                  <span className="hidden sm:inline">Grid</span>
                </button>
                <button
                  onClick={() => handleLayoutChange('table')}
                  disabled={isTransitioning}
                  className={`layouts-btn px-3 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${currentLayout === 'table' ? 'active bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'} ${isTransitioning ? 'opacity-50 cursor-not-allowed' : ''}`}
                  data-layouts="table"
                  data-desktop-only="true"
                  title="Table Layout"
                  aria-label="Switch to table layout"
                >
                  <Icon name="table" size={16} aria-hidden="true" />
                  <span className="hidden sm:inline">Table</span>
                </button>
                <button
                  onClick={() => handleLayoutChange('parallax')}
                  disabled={isTransitioning}
                  className={`layouts-btn px-3 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${currentLayout === 'parallax' ? 'active bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'} ${isTransitioning ? 'opacity-50 cursor-not-allowed' : ''}`}
                  data-layouts="parallax"
                  title="Parallax Layout"
                  aria-label="Switch to parallax layout"
                >
                  <Icon name="layers" size={16} aria-hidden="true" />
                  <span className="hidden sm:inline">Parallax</span>
                </button>
                {/* TODO: Carousel temporarily disabled - planning phase */}
                {/* <button
                  onClick={() => handleLayoutChange('carousel')}
                  disabled={isTransitioning}
                  className={`layouts-btn px-3 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${currentLayout === 'carousel' ? 'active bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'} ${isTransitioning ? 'opacity-50 cursor-not-allowed' : ''}`}
                  data-layouts="carousel"
                  title="Carousel Layout"
                >
                  <Icon name="move-horizontal" size={16} />
                  <span className="hidden sm:inline">Carousel</span>
                </button> */}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Posts Content Section */}
      <div ref={contentRef} className="px-6 py-12 w-full min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Layout Wrapper for FLIP animation */}
          <div ref={layoutWrapperRef} className="relative min-h-[200px]">
          {/* Posts Container */}
            <div 
              ref={postsContainerRef} 
              id="posts-container" 
              className={currentLayout === 'mason' ? 'block' : 'hidden'}
            >
              {currentLayout === 'mason' && <MasonGrid posts={normalized} base={base} />}
          </div>

            <div 
              ref={postsTableRef} 
              id="posts-table" 
              className={currentLayout === 'table' ? 'block' : 'hidden'}
            >
              {currentLayout === 'table' && <Table posts={normalized} base={base} />}
          </div>

            <div 
              ref={postsParallaxRef} 
              id="posts-parallax" 
              className={currentLayout === 'parallax' ? 'block' : 'hidden'}
            >
              {currentLayout === 'parallax' && <ParallaxGrid posts={normalized} base={base} />}
          </div>

            {/* TODO: Carousel temporarily disabled - planning phase */}
            {/* <div 
              ref={postsCarouselRef} 
              id="posts-carousel" 
              className={currentLayout === 'carousel' ? 'block' : 'hidden'}
            >
              {currentLayout === 'carousel' && <CarouselGrid posts={normalized} base={base} />}
            </div> */}
          </div>

          {(!normalized || normalized.length === 0) && (
            <div className="mt-8 text-center text-gray-600">
              <p>No posts found.</p>
              <p className="text-sm mt-2">Collection: {collection || 'None'}, Layouts: {currentLayout}</p>
              <p className="text-sm mt-2">Items count: {normalized?.length || 0}</p>
              <p className="text-sm mt-2">Is Blog/Projects Page: {isBlogOrProjectsPage ? 'Yes' : 'No'}</p>
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}

export default BlockPosts;
export { BlockPosts };
