"use client";

import { RefObject } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import SplitText from 'gsap/SplitText';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(SplitText, ScrollTrigger);

interface TextAnimationConfig {
  selector: string;
  type?: 'headline' | 'tagline' | 'description' | 'paragraph' | 'button' | 'name' | 'image';
  position?: string | number;
  animateEach?: boolean; // If true, each element gets its own ScrollTrigger
}

interface UseTextAnimationsOptions {
  trigger?: string;
  start?: string;
  once?: boolean;
}

/**
 * Reusable text animation hook matching blockHero animations
 * 
 * Animation types:
 * - headline: SplitText chars animation (yPercent: 100 -> 0, opacity: 0 -> 1)
 * - tagline: Simple fade + slide (y: 14 -> 0, autoAlpha: 0 -> 1)
 * - description/paragraph: Simple fade + slide (y: 20 -> 0, autoAlpha: 0 -> 1)
 * - name: Simple fade + slide (y: 16 -> 0, autoAlpha: 0 -> 1)
 * - button: Simple fade + slide with stagger (y: 10 -> 0, autoAlpha: 0 -> 1)
 * - image: Simple fade + slide (y: 18 -> 0, autoAlpha: 0 -> 1)
 */
export function useTextAnimations(
  scope: RefObject<HTMLElement | null>,
  configs: TextAnimationConfig[],
  options: UseTextAnimationsOptions = {},
  dependencies: unknown[] = []
) {
  useGSAP(() => {
    const root = scope.current;
    if (!root) return;

    // Only create timeline if we need it (when animateEach is false)
    // Most configs will use individual ScrollTriggers, so we'll create timeline lazily
    let tl: gsap.core.Timeline | null = null;
    
    const getTimeline = () => {
      if (!tl) {
        const scrollTriggerConfig = {
          trigger: options.trigger ? root.querySelector(options.trigger) || root : root,
          start: options.start || 'top 85%',
          once: options.once !== false,
        };
        tl = gsap.timeline({
          scrollTrigger: scrollTriggerConfig,
        });
      }
      return tl;
    };

    configs.forEach((config) => {
      const elements = root.querySelectorAll(config.selector);
      if (!elements || elements.length === 0) return;

      // If animateEach is explicitly false, use timeline. Otherwise, animate each element individually
      const shouldAnimateEach = config.animateEach !== false;

      switch (config.type) {
        case 'headline': {
          elements.forEach((el) => {
            const split = new SplitText(el as Element, {
              type: 'chars, words, lines',
              linesClass: 'line',
              wordsClass: 'word',
              charsClass: 'char',
              mask: 'lines',
              smartWrap: true,
            });

            gsap.set(split.chars, { yPercent: 100, opacity: 0 });
            
            if (shouldAnimateEach) {
              // Each element gets its own ScrollTrigger
              gsap.to(split.chars, {
                yPercent: 0,
                opacity: 1,
                duration: 1.2,
                stagger: 0.04,
                ease: 'power4.out',
                scrollTrigger: {
                  trigger: el,
                  start: options.start || 'top 85%',
                  once: options.once !== false,
                },
              });
            } else {
              getTimeline().to(
                split.chars,
                {
                  yPercent: 0,
                  opacity: 1,
                  duration: 1.2,
                  stagger: 0.04,
                  ease: 'power4.out',
                },
                config.position || 0
              );
            }
          });
          break;
        }

        case 'tagline': {
          if (shouldAnimateEach) {
            elements.forEach((el) => {
              gsap.fromTo(
                el,
                { y: 14, autoAlpha: 0 },
                {
                  y: 0,
                  autoAlpha: 1,
                  duration: 0.7,
                  ease: 'power2.out',
                  scrollTrigger: {
                    trigger: el,
                    start: options.start || 'top 85%',
                    once: options.once !== false,
                  },
                }
              );
            });
          } else {
            getTimeline().fromTo(
              elements,
              { y: 14, autoAlpha: 0 },
              {
                y: 0,
                autoAlpha: 1,
                duration: 0.7,
                ease: 'power2.out',
              },
              config.position || 0
            );
          }
          break;
        }

        case 'description':
        case 'paragraph': {
          if (shouldAnimateEach) {
            elements.forEach((el) => {
              gsap.fromTo(
                el,
                { y: 20, autoAlpha: 0 },
                {
                  y: 0,
                  autoAlpha: 1,
                  duration: 0.8,
                  ease: 'power2.out',
                  scrollTrigger: {
                    trigger: el,
                    start: options.start || 'top 85%',
                    once: options.once !== false,
                  },
                }
              );
            });
          } else {
            getTimeline().fromTo(
              elements,
              { y: 20, autoAlpha: 0 },
              {
                y: 0,
                autoAlpha: 1,
                duration: 0.8,
                ease: 'power2.out',
              },
              config.position || 0
            );
          }
          break;
        }

        case 'name': {
          if (shouldAnimateEach) {
            elements.forEach((el) => {
              gsap.fromTo(
                el,
                { y: 16, autoAlpha: 0 },
                {
                  y: 0,
                  autoAlpha: 1,
                  duration: 0.8,
                  ease: 'power2.out',
                  scrollTrigger: {
                    trigger: el,
                    start: options.start || 'top 85%',
                    once: options.once !== false,
                  },
                }
              );
            });
          } else {
            getTimeline().fromTo(
              elements,
              { y: 16, autoAlpha: 0 },
              {
                y: 0,
                autoAlpha: 1,
                duration: 0.8,
                ease: 'power2.out',
              },
              config.position || 0
            );
          }
          break;
        }

        case 'button': {
          if (shouldAnimateEach) {
            elements.forEach((el) => {
              gsap.fromTo(
                el,
                { y: 10, autoAlpha: 0 },
                {
                  y: 0,
                  autoAlpha: 1,
                  duration: 0.7,
                  ease: 'power2.out',
                  scrollTrigger: {
                    trigger: el,
                    start: options.start || 'top 85%',
                    once: options.once !== false,
                  },
                }
              );
            });
          } else {
            getTimeline().fromTo(
              elements,
              { y: 10, autoAlpha: 0 },
              {
                y: 0,
                autoAlpha: 1,
                duration: 0.7,
                stagger: 0.08,
                ease: 'power2.out',
              },
              config.position || 0
            );
          }
          break;
        }

        case 'image': {
          if (shouldAnimateEach) {
            elements.forEach((el) => {
              gsap.fromTo(
                el,
                { y: 18, autoAlpha: 0 },
                {
                  y: 0,
                  autoAlpha: 1,
                  duration: 0.9,
                  ease: 'power2.out',
                  scrollTrigger: {
                    trigger: el,
                    start: options.start || 'top 85%',
                    once: options.once !== false,
                  },
                }
              );
            });
          } else {
            getTimeline().fromTo(
              elements,
              { y: 18, autoAlpha: 0 },
              {
                y: 0,
                autoAlpha: 1,
                duration: 0.9,
                ease: 'power2.out',
              },
              config.position || 0
            );
          }
          break;
        }

        default: {
          // Default: simple fade + slide
          if (shouldAnimateEach) {
            elements.forEach((el) => {
              gsap.fromTo(
                el,
                { y: 20, autoAlpha: 0 },
                {
                  y: 0,
                  autoAlpha: 1,
                  duration: 0.8,
                  ease: 'power2.out',
                  scrollTrigger: {
                    trigger: el,
                    start: options.start || 'top 85%',
                    once: options.once !== false,
                  },
                }
              );
            });
          } else {
            getTimeline().fromTo(
              elements,
              { y: 20, autoAlpha: 0 },
              {
                y: 0,
                autoAlpha: 1,
                duration: 0.8,
                ease: 'power2.out',
              },
              config.position || 0
            );
          }
        }
      }
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => {
        const triggerEl = trigger.vars?.trigger as Element | undefined;
        if (triggerEl && root.contains(triggerEl)) {
          trigger.kill();
        }
      });
    };
  }, { scope, dependencies });
}

