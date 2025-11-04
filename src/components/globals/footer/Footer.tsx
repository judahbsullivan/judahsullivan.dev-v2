"use client";

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import SplitText from 'gsap/SplitText';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(SplitText, ScrollTrigger);

export function Footer() {
  const footerRef = useRef<HTMLElement>(null);
  const today = new Date().getFullYear();

  useGSAP(() => {
    const footer = footerRef.current;
    if (!footer) return;

    const headlineEl = footer.querySelector('.hero-headline');
    if (headlineEl) {
      const split = new SplitText(headlineEl as Element, {
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
        duration: 0.8,
        stagger: 0.03,
        ease: 'power4.out',
        scrollTrigger: {
          trigger: footer,
          start: 'top 80%',
          once: true,
        },
      });
    }
  }, { scope: footerRef });

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
        <p>Authored By: Judah Sullivan</p>
        <div className="flex items-center gap-6">
          <p className="relative">
            Copyright <span className="text-xs -right-3 absolute">©</span>
          </p>
          <p>{today}</p>
        </div>
      </div>
    </footer>
  );
}

