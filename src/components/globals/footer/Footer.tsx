"use client";

import { useRef } from 'react';
import { useTextAnimations } from '@/hooks/useTextAnimations';

export function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const today = new Date().getFullYear();

  // Use headline animation for headline and links, paragraph animation for paragraphs (line-based)
  // Use animateEach: false so all animations trigger when footer container enters view
  useTextAnimations(
    footerRef,
    [
      { selector: '.hero-headline', type: 'headline', animateEach: false, position: 0 },
      { selector: 'a', type: 'headline', animateEach: false, position: 0.2 },
      { selector: '.footer-text', type: 'paragraph', animateEach: false, position: 0.4 },
    ],
    {
      start: 'top 70%',
      once: true,
    }
  );

  return (
    <footer
      ref={footerRef}
      className="min-h-screen bg-foreground flex items-center justify-between text-secondary px-6 flex-col"
    >
      <div className="w-full text-center items-center-safe flex flex-col gap-24 pt-12">
        <h1 className="hero-headline tracking-tighter text-6xl md:text-[10vw] text-pretty break-keep leading-[.99] inline-block uppercase text-center overflow-hidden">
          Lets Work Together!
        </h1>
        <div className="flex items-center gap-6 md:gap-10 text-xl text-center md:text-2xl flex-wrap capitalize">
          <a target="_blank" rel="noopener noreferrer" href="https://linkedin.com/in/judahsullivan">
            Linkedin
          </a>
          <a target="_blank" rel="noopener noreferrer" href="https://profile.indeed.com/?hl=en_US&co=US&from=gnav-homepage">
            Indeed
          </a>
          <a target="_blank" rel="noopener noreferrer" href="https://youtube.com/judahsullivan">
            YouTube
          </a>
          <a target="_blank" rel="noopener noreferrer" href="https://github.com/judahbsullivan">
            Github
          </a>
        </div>
      </div>

      <div className="w-full flex-col md:flex-row flex justify-between items-center py-6 text-lg">
        <p className="footer-text">Authored By: Judah Sullivan</p>
        <div className="flex items-center gap-6">
          <p className="footer-text relative">
            Copyright <span className="text-xs -right-3 absolute">©</span>
          </p>
          <p className="footer-text">{today}</p>
        </div>
      </div>
    </footer>
  );
}

