"use client";

import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import SplitText from 'gsap/SplitText';
import { Menu } from './Menu';
import type { Navigation as NavigationType } from '@/directus/utils/types';
import { TransitionLink } from '@/components/globals/PageTransition';
import type { NavigationItems } from '@/directus/utils/types';

gsap.registerPlugin(ScrollTrigger, SplitText);

interface NavigationProps {
  navItems: NavigationType | null | undefined;
}

function NavigationComponent({ navItems }: NavigationProps) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const topLineRef = useRef<HTMLSpanElement>(null);
  const middleLineRef = useRef<HTMLSpanElement>(null);
  const bottomLineRef = useRef<HTMLSpanElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const scrollTriggerInitialized = useRef(false);
  const brandRef = useRef<HTMLSpanElement>(null);
  const firstPartRef = useRef<HTMLSpanElement>(null);   // "udah"
  const secondPartRef = useRef<HTMLSpanElement>(null);  // "ullivan"
  const leftInitialRef = useRef<HTMLSpanElement>(null); // "J"
  const rightInitialRef = useRef<HTMLSpanElement>(null); // "S"
  const firstSplitRef = useRef<SplitText | null>(null);
  const secondSplitRef = useRef<SplitText | null>(null);
  const brandTlRef = useRef<gsap.core.Timeline | null>(null);

  // Simple scroll animation for menu button on desktop only
  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return;
    if (scrollTriggerInitialized.current) return;
    
    const button = buttonRef.current;
    const header = headerRef.current;
    if (!button || !header) return;

    scrollTriggerInitialized.current = true;

    // Check if desktop
    const isDesktop = window.innerWidth >= 768;
    if (!isDesktop) {
      // On mobile, ensure button is visible
      gsap.set(button, { scale: 1, opacity: 1, pointerEvents: 'auto' });
      return;
    }

    // Start hidden on desktop (CSS already sets this, but ensure GSAP state matches)
    gsap.set(button, { scale: 0, opacity: 0, pointerEvents: 'none' });

    // Simple scroll trigger - show when scrolling away from header
    ScrollTrigger.create({
      trigger: header,
      start: 'bottom top',
      onEnter: () => {
        // Scrolled past header - show button
        gsap.to(button, { scale: 1, opacity: 1, pointerEvents: 'auto', duration: 0.25, ease: 'power1.out' });
      },
      onLeaveBack: () => {
        // Scrolled back to header - hide button
        gsap.to(button, { scale: 0, opacity: 0, pointerEvents: 'none', duration: 0.25, ease: 'power1.out' });
        setIsMenuOpen(false);
      },
    });
  }, []);

  // Home link hover split animation: keep J and S; animate "udah" and "ullivan"
  useEffect(() => {
    const first = firstPartRef.current;
    const second = secondPartRef.current;
    if (!first || !second) return;
    // Start hidden and not affecting layout; initials together
    gsap.set([first, second], { opacity: 0, position: 'absolute', pointerEvents: 'none' });
    if (leftInitialRef.current && rightInitialRef.current) {
      gsap.set([leftInitialRef.current, rightInitialRef.current], { x: 0 });
    }

    const onEnter = () => {
      if (!firstPartRef.current || !secondPartRef.current) return;
      if (brandTlRef.current) brandTlRef.current.kill();

      if (!firstSplitRef.current) {
        firstSplitRef.current = new SplitText(firstPartRef.current, { type: 'chars' });
      }
      if (!secondSplitRef.current) {
        secondSplitRef.current = new SplitText(secondPartRef.current, { type: 'chars' });
      }
      const firstChars = (firstSplitRef.current.chars || []) as HTMLElement[];
      const secondChars = (secondSplitRef.current.chars || []) as HTMLElement[];
      // Make text take space now
      gsap.set([firstPartRef.current, secondPartRef.current], { position: 'relative', opacity: 1, pointerEvents: 'auto' });
      gsap.set(firstChars, { yPercent: 100, opacity: 0, x: -1 });
      gsap.set(secondChars, { yPercent: 100, opacity: 0, x: 1 });

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      brandTlRef.current = tl;
      // Slightly nudge only S to make room (keep very small to avoid overlap)
      if (leftInitialRef.current && rightInitialRef.current) {
        tl.to(rightInitialRef.current, { x: 3, duration: 0.2 }, 0);
      }
      tl.to(firstChars, { yPercent: 0, opacity: 1, x: 0, duration: 0.35, stagger: 0.018 }, 0.02);
      tl.to(secondChars, { yPercent: 0, opacity: 1, x: 0, duration: 0.35, stagger: 0.018 }, 0.05);
    };

    const onLeave = () => {
      if (!firstSplitRef.current || !secondSplitRef.current) return;
      if (brandTlRef.current) brandTlRef.current.kill();
      const firstChars = firstSplitRef.current.chars as HTMLElement[];
      const secondChars = secondSplitRef.current.chars as HTMLElement[];
      const tl = gsap.timeline({ defaults: { ease: 'power3.inOut' } });
      brandTlRef.current = tl;
      tl.to([...secondChars].reverse(), { yPercent: 100, opacity: 0, x: 1, duration: 0.25, stagger: 0.01 }, 0);
      tl.to([...firstChars].reverse(), { yPercent: 100, opacity: 0, x: -1, duration: 0.25, stagger: 0.01 }, 0.04);
      // Return S back together slightly before finishing and ensure no bump
      if (leftInitialRef.current && rightInitialRef.current) {
        tl.to(rightInitialRef.current, { x: 0, duration: 0.18, ease: 'power3.out' }, 0.16);
      }
      // Hide and remove from layout at end
      tl.set([firstPartRef.current, secondPartRef.current], { opacity: 0, position: 'absolute', pointerEvents: 'none' }, 0.28);
    };

    const brand = brandRef.current;
    brand?.addEventListener('mouseenter', onEnter);
    brand?.addEventListener('mouseleave', onLeave);

    return () => {
      brand?.removeEventListener('mouseenter', onEnter);
      brand?.removeEventListener('mouseleave', onLeave);
      if (brandTlRef.current) brandTlRef.current.kill();
      try {
        firstSplitRef.current?.revert();
        secondSplitRef.current?.revert();
      } catch {}
      firstSplitRef.current = null;
      secondSplitRef.current = null;
    };
  }, []);

  // Animate hamburger lines when menu opens/closes
  useGSAP(() => {
    const topLine = topLineRef.current;
    const middleLine = middleLineRef.current;
    const bottomLine = bottomLineRef.current;
    const button = buttonRef.current;

    if (!topLine || !middleLine || !bottomLine || !button) return;

    if (isMenuOpen) {
      // Transform to X
      gsap.to(topLine, { y: 7, rotate: 45, transformOrigin: 'center', duration: 0.4, ease: 'power2.inOut' });
      gsap.to(middleLine, { opacity: 0, duration: 0.3, ease: 'power2.inOut' });
      gsap.to(bottomLine, { y: -7, rotate: -45, transformOrigin: 'center', duration: 0.4, ease: 'power2.inOut' });
      gsap.to(button, { background: 'white', duration: 0.4, ease: 'power2.inOut' });
    } else {
      // Transform back to hamburger
      gsap.to(topLine, { y: 0, rotate: 0, transformOrigin: 'center', duration: 0.4, ease: 'power2.inOut' });
      gsap.to(middleLine, { opacity: 1, duration: 0.3, ease: 'power2.inOut' });
      gsap.to(bottomLine, { y: 0, rotate: 0, transformOrigin: 'center', duration: 0.4, ease: 'power2.inOut' });
      gsap.to(button, { background: 'black', duration: 0.4, ease: 'power2.inOut' });
    }
  }, { dependencies: [isMenuOpen] });

  return (
    <>
      {/* Regular header - not sticky */}
      <header ref={headerRef} className="h-16 py-2 z-50 bg-muted relative w-full px-4 mx-auto">
        <div className="flex items-center h-full justify-between w-full">
          <TransitionLink href="/" aria-label="Go to home">
            <span ref={brandRef} className="inline-block select-none cursor-pointer text-lg font-bold uppercase whitespace-nowrap">
              <span ref={leftInitialRef} className="inline-block">J</span>
              <span ref={firstPartRef} className="inline-block mr-0.5">udah</span>
              <span className="inline-block">&nbsp;</span>
              <span ref={rightInitialRef} className="inline-block">S</span>
              <span ref={secondPartRef} className="inline-block ml-0.5">ullivan</span>
            </span>
          </TransitionLink>
          
          {/* Desktop Navigation - hidden on mobile */}
          {navItems && (
            <nav className="hidden md:flex items-center gap-6">
              {navItems.items?.map((item: NavigationItems) => {
                const pagePermalink = typeof item.page === 'object' && item.page !== null && 'permalink' in item.page 
                  ? (item.page as { permalink: string }).permalink 
                  : null;
                const postSlug = typeof item.post === 'object' && item.post !== null && 'slug' in item.post
                  ? (item.post as { slug: string }).slug
                  : null;
                const href =
                  item.url ||
                  pagePermalink ||
                  (postSlug ? `/post/${postSlug}` : null) ||
                  '#';
                const isActive = href && pathname === href;
                
                if (href && href.startsWith('/')) {
                  return (
                    <TransitionLink
                      key={item.id}
                      href={href}
                      className={`text-sm uppercase tracking-wide ${isActive ? 'underline' : ''}`}
                    >
                      {item.title}
                    </TransitionLink>
                  );
                }
                
                return (
                  <a
                    key={item.id}
                    href={href || '#'}
                    target={href?.startsWith('http') ? '_blank' : undefined}
                    rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="text-sm uppercase tracking-wide"
                  >
                    {item.title}
                  </a>
                );
              })}
            </nav>
          )}

        </div>
      </header>

      {/* Menu Button - fixed bottom on mobile, in header position on desktop */}
      {navItems && (
        <button
          ref={buttonRef}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="fixed top-2 right-4 md:right-6 md:top-2 z-100 flex gap-1.5 bg-black rounded-full items-center justify-center flex-col w-12 h-12 p-2"
          aria-label="Toggle navigation menu"
          aria-expanded={isMenuOpen}
        >
          <span ref={topLineRef} className="border bg-black w-full"></span>
          <span ref={middleLineRef} className="border bg-black w-full"></span>
          <span ref={bottomLineRef} className="border bg-black w-full"></span>
        </button>
      )}

      {/* Menu Panel */}
      {navItems && (
        <Menu navItems={navItems} isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      )}

     
    </>
  );
}

export { NavigationComponent as Navigation };
export default NavigationComponent;

