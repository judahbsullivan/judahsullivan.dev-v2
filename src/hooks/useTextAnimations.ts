"use client";

import { RefObject } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import SplitText from 'gsap/SplitText';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { beginGate, resolveGate } from '@/components/globals/transitionGate';

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
  notifyOnComplete?: boolean;
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
    
    const splitInstances: SplitText[] = [];
    let gateStarted = false;
    let pendingToComplete = 0;
    const maybeStartGate = () => {
      if (options.notifyOnComplete && !gateStarted) {
        beginGate();
        gateStarted = true;
      }
    };
    const markOneDone = () => {
      if (!options.notifyOnComplete) return;
      pendingToComplete = Math.max(0, pendingToComplete - 1);
      if (pendingToComplete === 0 && gateStarted) {
        resolveGate();
      }
    };
    const isInView = (el: Element) => {
      const rect = el.getBoundingClientRect();
      const vpH = typeof window !== 'undefined' ? window.innerHeight : 0;
      return rect.top <= vpH * 0.9; // approximate 'top 90%' start
    };
    const makeScrollTrigger = (el: Element) => {
      try {
        if (!el || !(el instanceof Element)) return undefined;
        // Ensure element is attached and measurable
        if (typeof el.getBoundingClientRect !== 'function') return undefined;
        // document.contains guards detached nodes
        if (typeof document !== 'undefined' && !document.contains(el)) return undefined;
        return {
          trigger: el,
          start: options.start || 'top 85%',
          once: options.once !== false,
          invalidateOnRefresh: true,
        };
      } catch {
        return undefined;
      }
    };
    const windowLoadHandler = () => {
      // Refresh after images load to recalc positions
      try {
        ScrollTrigger.refresh();
      } catch {}
    };
    const runAfterFontsReady = (cb: () => void) => {
      try {
        const fontsLike = (document as Document & { fonts?: { ready?: Promise<unknown>; status?: string } }).fonts;
        if (fontsLike?.status === 'loaded') {
          requestAnimationFrame(cb);
          return;
        }
        const ready = fontsLike?.ready;
        if (ready && typeof (ready as Promise<unknown>).then === 'function') {
          (ready as Promise<unknown>).then(() => requestAnimationFrame(cb));
          return;
        }
      } catch {
        // ignore
      }
      // Fallback
      requestAnimationFrame(cb);
    };
    const processedOnce = new WeakSet<Element>();

    // Only create timeline if we need it (when animateEach is false)
    // Most configs will use individual ScrollTriggers, so we'll create timeline lazily
    let tl: gsap.core.Timeline | null = null;
    
    const getTimeline = () => {
      if (!tl) {
        const triggerElement = options.trigger ? root.querySelector(options.trigger) || root : root;
        const scrollTriggerConfig = {
          trigger: triggerElement,
          start: options.start || 'top 85%',
          once: options.once !== false,
          invalidateOnRefresh: true,
        };
        tl = gsap.timeline({
          scrollTrigger: scrollTriggerConfig,
        });
      }
      return tl;
    };

    // Check if any config needs timeline (animateEach: false)
    const needsTimeline = configs.some(config => config.animateEach === false);
    
    // Create timeline upfront if needed
    if (needsTimeline) {
      getTimeline();
    }

    configs.forEach((config) => {
      const elements = root.querySelectorAll(config.selector);
      if (!elements || elements.length === 0) return;

      // If animateEach is explicitly false, use timeline. Otherwise, animate each element individually
      const shouldAnimateEach = config.animateEach !== false;

      switch (config.type) {
        case 'headline': {
          elements.forEach((el) => {
            if (!el || !(el instanceof Element) || !el.isConnected) return;
            if (processedOnce.has(el)) return;
            runAfterFontsReady(() => {
              if (processedOnce.has(el)) return;
              try {
                // Avoid double-splitting if already split
                let split: SplitText | null = null;
                const hasChars = (el as Element).querySelector('.char');
              // Decide split granularity: <= 2 words -> chars; otherwise lines
              const textContent = (el.textContent || '').trim();
              const wordCount = textContent ? textContent.split(/\s+/).length : 0;
              const useLines = wordCount > 2;
              const lineExists = (el as Element).querySelector('.line');
              if (!hasChars && !lineExists) {
                split = new SplitText(el as Element, {
                  type: useLines ? 'lines' : 'chars, words, lines',
                  linesClass: 'line',
                  wordsClass: 'word',
                  charsClass: 'char',
                  mask: 'lines',
                  smartWrap: true,
                });
                splitInstances.push(split);
              }

              const elementsToAnimate: HTMLElement[] = (() => {
                if (useLines) {
                  const lines = split ? (split.lines as HTMLElement[]) : (Array.from((el as Element).querySelectorAll('.line')) as HTMLElement[]);
                  return lines || [];
                }
                const chars = split ? (split.chars as HTMLElement[]) : (Array.from((el as Element).querySelectorAll('.char')) as HTMLElement[]);
                return chars || [];
              })();
              if (!elementsToAnimate || elementsToAnimate.length === 0) return;

              // Remove prohibited ARIA attributes from paragraph elements and their children
              if (el.tagName === 'P') {
                el.removeAttribute('role');
                el.removeAttribute('aria-label');
                el.removeAttribute('aria-labelledby');
                elementsToAnimate.forEach((child) => {
                  child.removeAttribute('role');
                  child.removeAttribute('aria-label');
                  child.removeAttribute('aria-labelledby');
                });
              }

              if (isInView(el)) {
                maybeStartGate();
                pendingToComplete += 1;
              }

              // Only set initial state if not already animated
              if (useLines) {
                gsap.set(elementsToAnimate, { yPercent: 100, opacity: 0 });
              } else {
                gsap.set(elementsToAnimate, { yPercent: 100, opacity: 0 });
              }
              
              const animConfig = {
                yPercent: 0,
                opacity: 1,
                duration: 1.2,
                stagger: useLines ? 0.06 : 0.04,
                ease: 'power4.out' as gsap.EaseString,
                onComplete: markOneDone,
              };

              if (shouldAnimateEach) {
                // Each element gets its own ScrollTrigger
                gsap.to(elementsToAnimate, {
                  ...animConfig,
                  immediateRender: false,
                  scrollTrigger: makeScrollTrigger(el),
                });
              } else {
                getTimeline().to(
                  elementsToAnimate,
                  animConfig,
                  config.position || 0
                );
              }
                processedOnce.add(el);
              } catch (error) {
                console.warn('ScrollTrigger error in headline animation:', error);
              }
            });
          });
          break;
        }

        case 'tagline': {
          if (shouldAnimateEach) {
            elements.forEach((el) => {
              if (!el || !(el instanceof Element) || !el.isConnected) return;
              try {
                if (isInView(el)) {
                  maybeStartGate();
                  pendingToComplete += 1;
                }
                gsap.from(el, {
                  y: 14,
                  autoAlpha: 0,
                  duration: 0.7,
                  ease: 'power2.out',
                  onComplete: markOneDone,
                  scrollTrigger: makeScrollTrigger(el),
                });
              } catch (error) {
                // Silently fail if ScrollTrigger can't be created
                console.warn('ScrollTrigger error:', error);
              }
            });
          } else {
            if (isInView(root)) {
              maybeStartGate();
              pendingToComplete += 1;
            }
            getTimeline().from(elements as unknown as gsap.TweenTarget, {
              y: 14,
              autoAlpha: 0,
              duration: 0.7,
              ease: 'power2.out',
              onComplete: markOneDone,
            }, config.position || 0);
          }
          break;
        }

        case 'description':
        case 'paragraph': {
          if (shouldAnimateEach) {
            elements.forEach((el) => {
              if (!el || !(el instanceof Element) || !el.isConnected) return;
              if (processedOnce.has(el)) return;
              runAfterFontsReady(() => {
                if (processedOnce.has(el)) return;
                try {
                  // Split into lines for smoother line-by-line entrance
                  let split: SplitText | null = null;
                  const hasLines = (el as Element).querySelector('.line');
                  if (!hasLines) {
                    split = new SplitText(el as Element, {
                      type: 'lines',
                      linesClass: 'line',
                      smartWrap: true,
                    });
                    splitInstances.push(split);
                  }
  
                  const lines = split ? (split.lines as HTMLElement[]) : (Array.from((el as Element).querySelectorAll('.line')) as HTMLElement[]);
                  if (!lines || lines.length === 0) return;

                  // Remove prohibited ARIA attributes from paragraph elements and their children
                  if (el.tagName === 'P') {
                    el.removeAttribute('role');
                    el.removeAttribute('aria-label');
                    el.removeAttribute('aria-labelledby');
                    lines.forEach((line) => {
                      line.removeAttribute('role');
                      line.removeAttribute('aria-label');
                      line.removeAttribute('aria-labelledby');
                    });
                  }

                  gsap.from(lines, {
                    yPercent: 100,
                    opacity: 0,
                    duration: 0.9,
                    ease: 'power3.out',
                    stagger: 0.05,
                    scrollTrigger: makeScrollTrigger(el),
                  });
                  processedOnce.add(el);
                } catch (error) {
                  console.warn('ScrollTrigger error:', error);
                }
              });
            });
          } else {
            // Fallback to simple fade/slide on timeline when not animating each separately
            getTimeline().from(elements as unknown as gsap.TweenTarget, {
              y: 20,
              autoAlpha: 0,
              duration: 0.8,
              ease: 'power2.out',
            }, config.position || 0);
          }
          break;
        }

        case 'name': {
          if (shouldAnimateEach) {
            elements.forEach((el) => {
              if (!el || !(el instanceof Element) || !el.isConnected) return;
              try {
                if (isInView(el)) {
                  maybeStartGate();
                  pendingToComplete += 1;
                }
                gsap.from(el, {
                  y: 16,
                  autoAlpha: 0,
                  duration: 0.8,
                  ease: 'power2.out',
                  onComplete: markOneDone,
                  scrollTrigger: makeScrollTrigger(el),
                });
              } catch (error) {
                console.warn('ScrollTrigger error:', error);
              }
            });
          } else {
            if (isInView(root)) {
              maybeStartGate();
              pendingToComplete += 1;
            }
            getTimeline().from(elements as unknown as gsap.TweenTarget, {
              y: 16,
              autoAlpha: 0,
              duration: 0.8,
              ease: 'power2.out',
              onComplete: markOneDone,
            }, config.position || 0);
          }
          break;
        }

        case 'button': {
          if (shouldAnimateEach) {
            elements.forEach((el) => {
              if (!el || !(el instanceof Element) || !el.isConnected) return;
              try {
                if (isInView(el)) {
                  maybeStartGate();
                  pendingToComplete += 1;
                }
                gsap.from(el, {
                  y: 10,
                  autoAlpha: 0,
                  duration: 0.7,
                  ease: 'power2.out',
                  onComplete: markOneDone,
                  scrollTrigger: makeScrollTrigger(el),
                });
              } catch (error) {
                console.warn('ScrollTrigger error:', error);
              }
            });
          } else {
            if (isInView(root)) {
              maybeStartGate();
              pendingToComplete += 1;
            }
            getTimeline().from(elements as unknown as gsap.TweenTarget, {
              y: 10,
              autoAlpha: 0,
              duration: 0.7,
              stagger: 0.08,
              ease: 'power2.out',
              onComplete: markOneDone,
            }, config.position || 0);
          }
          break;
        }

        case 'image': {
          if (shouldAnimateEach) {
            elements.forEach((el) => {
              if (!el || !(el instanceof Element) || !el.isConnected) return;
              try {
                if (isInView(el)) {
                  maybeStartGate();
                  pendingToComplete += 1;
                }
                gsap.from(el, {
                  y: 18,
                  autoAlpha: 0,
                  duration: 0.9,
                  ease: 'power2.out',
                  onComplete: markOneDone,
                  scrollTrigger: makeScrollTrigger(el),
                });
              } catch (error) {
                console.warn('ScrollTrigger error:', error);
              }
            });
          } else {
            if (isInView(root)) {
              maybeStartGate();
              pendingToComplete += 1;
            }
            getTimeline().from(elements as unknown as gsap.TweenTarget, {
              y: 18,
              autoAlpha: 0,
              duration: 0.9,
              ease: 'power2.out',
              onComplete: markOneDone,
            }, config.position || 0);
          }
          break;
        }

        default: {
          // Default: simple fade + slide
          if (shouldAnimateEach) {
            elements.forEach((el) => {
              if (!el || !(el instanceof Element) || !el.isConnected) return;
              try {
                if (isInView(el)) {
                  maybeStartGate();
                  pendingToComplete += 1;
                }
                gsap.from(el, {
                  y: 20,
                  autoAlpha: 0,
                  duration: 0.8,
                  ease: 'power2.out',
                  onComplete: markOneDone,
                  scrollTrigger: makeScrollTrigger(el),
                });
              } catch (error) {
                console.warn('ScrollTrigger error:', error);
              }
            });
          } else {
            if (isInView(root)) {
              maybeStartGate();
              pendingToComplete += 1;
            }
            getTimeline().from(elements as unknown as gsap.TweenTarget, {
              y: 20,
              autoAlpha: 0,
              duration: 0.8,
              ease: 'power2.out',
              onComplete: markOneDone,
            }, config.position || 0);
          }
        }
      }
    });

    // Refresh after fonts are ready (prevents misfired triggers due to reflow)
    try {
      type FontFaceSetLike = { ready?: Promise<unknown> } | undefined;
      const fontsLike: FontFaceSetLike = (document as Document & { fonts?: FontFaceSetLike }).fonts;
      const fontsReady = fontsLike?.ready;
      if (fontsReady && typeof (fontsReady as Promise<unknown>).then === 'function') {
        (fontsReady as Promise<unknown>).then(() => {
          try { ScrollTrigger.refresh(); } catch {}
        });
      } else {
        requestAnimationFrame(() => {
          try { ScrollTrigger.refresh(); } catch {}
        });
      }
    } catch {}
    // Also refresh after window load (images)
    window.addEventListener('load', windowLoadHandler, { once: true });

    return () => {
      // Revert any SplitText instances created by this hook run
      splitInstances.forEach((s) => {
        try { s.revert(); } catch {}
      });
      // Kill only triggers inside our root
      ScrollTrigger.getAll().forEach((trigger) => {
        const triggerEl = trigger.vars?.trigger as Element | undefined;
        if (triggerEl && root.contains(triggerEl)) {
          trigger.kill();
        }
      });
      window.removeEventListener('load', windowLoadHandler);
    };
  }, { scope, dependencies });
}

