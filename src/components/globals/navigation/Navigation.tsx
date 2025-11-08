"use client";

import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { Menu } from './Menu';
import type { Navigation as NavigationType } from '@/directus/utils/types';
import { TransitionLink } from '@/components/globals/PageTransition';
import type { NavigationItems } from '@/directus/utils/types';

gsap.registerPlugin(ScrollTrigger);

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
          <TransitionLink href="/">
            <p>Judah Sullivan</p>
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

