"use client";

import { useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import SplitText from 'gsap/SplitText';
import type { Navigation, NavigationItems } from '@/directus/utils/types';
import { TransitionLink } from '@/components/globals/PageTransition';

gsap.registerPlugin(SplitText);

interface MenuProps {
  navItems: Navigation;
  isOpen: boolean;
  onClose: () => void;
}

export function Menu({ navItems, isOpen, onClose }: MenuProps) {
  const navPanelRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<(HTMLAnchorElement | null)[]>([]);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const pathname = usePathname();

  // Animate text when menu opens
  useGSAP(() => {
    if (!isOpen) return;

    const panel = navPanelRef.current;
    if (!panel) return;

    // Wait for panel to be visible before animating text
    const timeoutId = setTimeout(() => {
      const headings = panel.querySelectorAll('.menu-heading');
      const navLinks = panel.querySelectorAll('.nav-link');
      const socialLinks = panel.querySelectorAll('.social-link');

      // Animate headings
      headings.forEach((heading) => {
        const split = new SplitText(heading as Element, {
          type: 'chars, words, lines',
          linesClass: 'line',
          wordsClass: 'word',
          charsClass: 'char',
          mask: 'lines',
          smartWrap: true,
        });

        gsap.set(split.chars, { yPercent: 100, opacity: 0 });
        gsap.to(split.chars, {
          yPercent: 0,
          opacity: 1,
          duration: 1.2,
          stagger: 0.04,
          ease: 'power4.out',
        });
      });

      // Animate nav links
      navLinks.forEach((link) => {
        const split = new SplitText(link as Element, {
          type: 'chars, words, lines',
          linesClass: 'line',
          wordsClass: 'word',
          charsClass: 'char',
          mask: 'lines',
          smartWrap: true,
        });

        gsap.set(split.chars, { yPercent: 100, opacity: 0 });
        gsap.to(split.chars, {
          yPercent: 0,
          opacity: 1,
          duration: 1.2,
          stagger: 0.04,
          ease: 'power4.out',
        });
      });

      // Animate social links
      socialLinks.forEach((link) => {
        const split = new SplitText(link as Element, {
          type: 'chars, words, lines',
          linesClass: 'line',
          wordsClass: 'word',
          charsClass: 'char',
          mask: 'lines',
          smartWrap: true,
        });

        gsap.set(split.chars, { yPercent: 100, opacity: 0 });
        gsap.to(split.chars, {
          yPercent: 0,
          opacity: 1,
          duration: 1.2,
          stagger: 0.04,
          ease: 'power4.out',
        });
      });
    }, 100); // Small delay to ensure panel is visible

    return () => {
      clearTimeout(timeoutId);
    };
  }, { dependencies: [isOpen] });

  // Initialize timeline once
  useGSAP(() => {
    const navPanel = navPanelRef.current;
    if (!navPanel) return;

    // Kill existing timeline if it exists
    if (timelineRef.current) {
      timelineRef.current.kill();
    }

    // Set initial state - panel off-screen to the right
    gsap.set(navPanel, { x: '100%' });

    const tl = gsap.timeline({ paused: true });

    // Animate panel into view (slide in from right)
    tl.to(navPanel, {
      x: 0,
      duration: 0.8,
      ease: 'power4.inOut',
    });

    timelineRef.current = tl;

    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill();
        timelineRef.current = null;
      }
    };
  }, { dependencies: [navItems] });

  // Control menu open/close
  useEffect(() => {
    if (!timelineRef.current) return;

    if (isOpen) {
      timelineRef.current.play();
      document.body.style.overflow = 'hidden';
    } else {
      timelineRef.current.reverse();
      document.body.style.overflow = 'auto';
    }
  }, [isOpen]);

  // Set up click handlers to close menu
  useEffect(() => {
    const links = linksRef.current.filter(Boolean) as HTMLAnchorElement[];

    links.forEach(link => {
      const handleClick = () => {
        onClose();
      };

      link.addEventListener('click', handleClick);
      return () => {
        link.removeEventListener('click', handleClick);
      };
    });
  }, [onClose]);

  return (
    <div
        ref={navPanelRef}
        id="mobile-nav"
        className="fixed min-h-dvh right-0 top-0 w-full md:w-[35%] z-50 bg-background text-foreground px-6 py-10 border-l border-border flex flex-col justify-between"
      >
        <div className="flex-1 flex flex-col justify-center">
          {/* Navigation Heading */}
          <h2 className="menu-heading text-sm uppercase tracking-wider text-muted-foreground mb-8">
            Navigation
          </h2>

          {/* Navigation Links */}
          <ul className="space-y-8 items-left flex flex-col text-left">
            {navItems?.items?.map((item: NavigationItems, index: number) => {
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
              return (
                <li key={item.id || index}>
                  {href && href.startsWith('/') ? (
                    <TransitionLink
                    ref={(el) => {
                      linksRef.current[index] = el;
                    }}
                    href={href}
                    className={`nav-link group block uppercase text-foreground text-[clamp(2.75rem,5vw,5rem)] leading-none tracking-tight ${isActive ? 'underline' : ''}`}
                    >
                      {item.title}
                    </TransitionLink>
                  ) : (
                    <a
                      ref={(el) => {
                        linksRef.current[index] = el;
                      }}
                      href={href || '#'}
                      target={href?.startsWith('http') ? '_blank' : undefined}
                      rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className={`nav-link group block uppercase text-foreground text-[clamp(2.75rem,5vw,5rem)] leading-none tracking-tight ${isActive ? 'underline' : ''}`}
                  >
                    {item.title}
                  </a>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Social Links at Bottom */}
        <div className="pb-8">
          <h3 className="menu-heading text-sm uppercase tracking-wider text-muted-foreground mb-6">
            Connect
          </h3>
          <div className="flex items-center gap-6 md:gap-10 text-xl md:text-2xl flex-wrap">
            <a 
              href="https://linkedin.com/in/judahsullivan" 
              target="_blank" 
              rel="noopener noreferrer"
              className="social-link capitalize"
            >
              Linkedin
            </a>
            <a 
              href="https://profile.indeed.com/?hl=en_US&co=US&from=gnav-homepage" 
              target="_blank" 
              rel="noopener noreferrer"
              className="social-link capitalize"
            >
              Indeed
            </a>
            <a 
              href="https://youtube.com/judahsullivan" 
              target="_blank" 
              rel="noopener noreferrer"
              className="social-link capitalize"
            >
              YouTube
            </a>
            <a 
              href="https://github.com/judahbsullivan" 
              target="_blank" 
              rel="noopener noreferrer"
              className="social-link capitalize"
            >
              Github
            </a>
          </div>
        </div>
      </div>
  );
}

