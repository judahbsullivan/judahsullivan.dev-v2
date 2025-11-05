"use client";

import { useRef, useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import type { Navigation } from '@/directus/utils/types';

interface MenuProps {
  navItems: Navigation;
}

export function Menu({ navItems }: MenuProps) {
  const navBtnRef = useRef<HTMLButtonElement>(null);
  const navPanelRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<(HTMLAnchorElement | null)[]>([]);
  const topLineRef = useRef<HTMLSpanElement>(null);
  const middleLineRef = useRef<HTMLSpanElement>(null);
  const bottomLineRef = useRef<HTMLSpanElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const isOpenRef = useRef(false);
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Initialize timeline once
  useGSAP(() => {
    const navBtn = navBtnRef.current;
    const navPanel = navPanelRef.current;
    const links = linksRef.current.filter(Boolean) as HTMLAnchorElement[];
    const topLine = topLineRef.current;
    const middleLine = middleLineRef.current;
    const bottomLine = bottomLineRef.current;

    if (!navBtn || !navPanel || !topLine || !middleLine || !bottomLine) return;

    // Kill existing timeline if it exists
    if (timelineRef.current) {
      timelineRef.current.kill();
    }

    const tl = gsap.timeline({ paused: true, reversed: true });

    tl.to(navPanel, {
      x: '-100%',
      duration: 0.8,
      ease: 'power4.inOut',
    })
      .to(navBtn, {
        rotation: 90,
        duration: 0.8,
        ease: 'power4.inOut',
      }, 0)
      .from(links, {
        y: 50,
        opacity: 0,
        duration: 0.4,
        stagger: 0.1,
        ease: 'power2.out',
      })
      .to(topLine, { y: 7, rotate: 45, transformOrigin: 'center', duration: 0.4, ease: 'power2.inOut' }, 0)
      .to(middleLine, { opacity: 0, duration: 0.3, ease: 'power2.inOut' }, 0)
      .to(bottomLine, { y: -7, rotate: -45, transformOrigin: 'center', duration: 0.4, ease: 'power2.inOut' }, 0)
      .to(navBtn, { background: 'white' }, 0);

    timelineRef.current = tl;

    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill();
        timelineRef.current = null;
      }
    };
  }, { scope: navBtnRef, dependencies: [navItems] });

  // Set up event listeners for flip animations
  useGSAP(() => {
    const links = linksRef.current.filter(Boolean) as HTMLAnchorElement[];
    const cleanupFunctions: Array<() => void> = [];

    links.forEach(link => {
      const wrap = link.querySelector('.flip-wrap');
      const front = link.querySelector('.flip-front');
      const back = link.querySelector('.flip-back');
      if (!wrap || !front || !back) return;

      const handleMouseEnter = () => {
        gsap.killTweensOf([front, back]);
        gsap.set(back, { rotationX: -90, transformOrigin: '50% 50% -0.01px' });
        gsap.to(front, { rotationX: 90, duration: 0.35, ease: 'power2.in', transformOrigin: '50% 50% -0.01px' });
        gsap.to(back, { rotationX: 0, duration: 0.5, ease: 'power3.out', delay: 0.15 });
      };

      const handleMouseLeave = () => {
        gsap.killTweensOf([front, back]);
        gsap.to(back, { rotationX: -90, duration: 0.3, ease: 'power2.in' });
        gsap.to(front, { rotationX: 0, duration: 0.4, ease: 'power3.out', delay: 0.05 });
      };

      const handleClick = () => {
        if (isOpenRef.current && timelineRef.current) {
          isOpenRef.current = false;
          setIsOpen(false);
          timelineRef.current.reverse();
          document.body.style.overflow = 'auto';
          document.body.classList.remove('menu-open');
        }
      };

      link.addEventListener('mouseenter', handleMouseEnter);
      link.addEventListener('mouseleave', handleMouseLeave);
      link.addEventListener('click', handleClick);

      cleanupFunctions.push(() => {
        link.removeEventListener('mouseenter', handleMouseEnter);
        link.removeEventListener('mouseleave', handleMouseLeave);
        link.removeEventListener('click', handleClick);
        gsap.killTweensOf([front, back]);
      });
    });

    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
    };
  }, { scope: navBtnRef, dependencies: [navItems] });

  // Handle toggle
  const handleToggle = useCallback(() => {
    if (!timelineRef.current) return;

    const newState = !isOpenRef.current;
    isOpenRef.current = newState;
    setIsOpen(newState);

    if (newState) {
      timelineRef.current.play();
      document.body.style.overflow = 'hidden';
      document.body.classList.add('menu-open');
    } else {
      timelineRef.current.reverse();
      document.body.style.overflow = 'auto';
      document.body.classList.remove('menu-open');
    }
  }, []);

  // Set up button click handler
  useEffect(() => {
    const navBtn = navBtnRef.current;
    if (!navBtn) return;

    navBtn.addEventListener('click', handleToggle);
    return () => {
      navBtn.removeEventListener('click', handleToggle);
    };
  }, [handleToggle]);

  return (
    <>
      <button
        ref={navBtnRef}
        id="nav-btn"
        className="flex gap-1.5 bg-black rounded-full bg-blend-difference items-center justify-center flex-col w-12 h-12 p-2 z-[60] relative"
        aria-label="Toggle navigation menu"
        aria-expanded={isOpen}
      >
        <span ref={topLineRef} className="line top border bg-black w-full bg-blend-difference" aria-hidden="true"></span>
        <span ref={middleLineRef} className="line middle border bg-black w-full bg-blend-difference" aria-hidden="true"></span>
        <span ref={bottomLineRef} className="line bottom border bg-black w-full bg-blend-difference" aria-hidden="true"></span>
      </button>

      <div
        ref={navPanelRef}
        id="mobile-nav"
        className="fixed min-h-[100dvh] left-full top-0 w-full z-50 bg-black text-white px-6 py-10"
      >
        <ul className="space-y-8 items-left h-screen justify-center gap-24 flex flex-col text-left">
          {navItems?.items?.map((item: any, index: number) => {
            const href =
              item.url ||
              (typeof item.page === 'object' && item.page?.permalink) ||
              (typeof item.post === 'object' && item.post?.slug ? `/post/${item.post.slug}` : null) ||
              '#';
            const isActive = href && pathname === href;
            return (
              <li key={item.id || index}>
                <a
                  ref={(el) => {
                    linksRef.current[index] = el;
                  }}
                  href={href}
                  className={`nav-link group block uppercase text-white ${isActive ? 'active' : ''}`}
                >
                  <span className="flip-wrap inline-block">
                    <span className="flip-front inline-block">{item.title}</span>
                    <span className="flip-back inline-block" aria-hidden="true">{item.title}</span>
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>

      <style jsx>{`
        .nav-link {
          font-size: clamp(2.75rem, 5vw, 5rem);
          line-height: 1;
        }
        .nav-link.active .flip-front {
          text-decoration: underline;
        }
        .flip-wrap {
          perspective: 1000px;
        }
        .flip-front,
        .flip-back {
          display: inline-block;
          will-change: transform;
          backface-visibility: hidden;
        }
        .flip-back {
          position: absolute;
          left: 0;
          top: 0;
        }
      `}</style>
    </>
  );
}

