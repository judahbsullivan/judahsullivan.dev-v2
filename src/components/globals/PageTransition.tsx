'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type MouseEventHandler,
  type PropsWithChildren,
} from 'react';
import gsap from 'gsap';
import { waitForGate } from './transitionGate';
import SplitText from 'gsap/SplitText';
gsap.registerPlugin(SplitText);

const OVERLAY_IN_DURATION = 1;
const OVERLAY_OUT_DURATION = 1;

// Helper function to get page title from pathname
function getPageTitleFromPath(pathname: string): string {
  if (pathname === '/') {
    return 'HOME';
  }
  
  // Remove leading slash and split by '/'
  const parts = pathname.replace(/^\//, '').split('/').filter(Boolean);
  
  if (parts.length === 0) {
    return 'HOME';
  }
  
  // Get the last part and convert to title
  const lastPart = parts[parts.length - 1];
  return lastPart
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .toUpperCase();
}

interface TransitionContextValue {
  navigate: (href: string) => void;
  isTransitioning: boolean;
}

const TransitionContext = createContext<TransitionContextValue | null>(null);

export function usePageTransition() {
  const context = useContext(TransitionContext);
  const router = useRouter();

  const fallbackNavigate = useCallback(
    (href: string) => {
      router.push(href);
    },
    [router]
  );

  return useMemo<TransitionContextValue>(
    () =>
      context ?? {
        navigate: fallbackNavigate,
        isTransitioning: false,
      },
    [context, fallbackNavigate]
  );
}

export default function PageTransition({ children }: PropsWithChildren) {
  const router = useRouter();
  const pathname = usePathname();

  const overlayRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const previousPathnameRef = useRef<string>(pathname);
  const isNavigatingRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const animationRef = useRef<gsap.core.Tween | null>(null);
  const titleAnimationRef = useRef<gsap.core.Tween | null>(null);
  const isMountedRef = useRef(false);
  const overlaySplitRef = useRef<SplitText | null>(null);
  const titleEnterDoneRef = useRef(false);
  const titleEnterResolverRef = useRef<(() => void) | null>(null);
  const expectedTitleEnterMsRef = useRef<number>(1500);

  const waitForTitleEnter = useCallback((timeoutMs = 3000) => {
    if (titleEnterDoneRef.current) return Promise.resolve();
    return new Promise<void>((resolve) => {
      const to = setTimeout(() => {
        resolve();
      }, timeoutMs);
      titleEnterResolverRef.current = () => {
        clearTimeout(to);
        resolve();
      };
    });
  }, []);

  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayChildren, setDisplayChildren] = useState(children);
  const [transitionTitle, setTransitionTitle] = useState<string>('');

  const navigate = useCallback(
    (href: string) => {
      if (!href || href === pathname || isTransitioning) {
        return;
      }

      // Clear any pending timeouts from previous navigation
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      setIsTransitioning(true);
      isNavigatingRef.current = true;

      // Get title for the destination route
      const title = getPageTitleFromPath(href);
      setTransitionTitle(title);

      const overlay = overlayRef.current;
      const titleElement = titleRef.current;
      
      if (!overlay) {
        router.push(href);
        return;
      }

      gsap.killTweensOf(overlay);
      if (titleElement) {
        gsap.killTweensOf(titleElement);
        const chars = titleElement.querySelectorAll('.char');
        gsap.killTweensOf(chars);
      }

      gsap.set(overlay, {
        opacity: 1,
        scaleY: 0,
        transformOrigin: 'bottom center',
        pointerEvents: 'auto',
      });

      // Kill any existing animations
      if (animationRef.current) {
        animationRef.current.kill();
      }
      if (titleAnimationRef.current) {
        titleAnimationRef.current.kill();
      }

      // Animate overlay in, then navigate
      animationRef.current = gsap.to(overlay, {
        scaleY: 1,
        duration: OVERLAY_IN_DURATION,
        ease: 'power2.inOut',
        onComplete: () => {
          // Start route change after overlay fully covers screen
          router.push(href);
          animationRef.current = null;
        },
      });
    },
    [isTransitioning, pathname, router]
  );

  useLayoutEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;

    const pathnameChanged = pathname !== previousPathnameRef.current;

    if (isNavigatingRef.current && pathnameChanged) {
      // Pathname changed - update to new children and keep overlay visible
      isNavigatingRef.current = false;
      
      // Defer state update
      requestAnimationFrame(() => {
        setDisplayChildren(children);
      });
      
      gsap.killTweensOf(overlay);
      gsap.set(overlay, {
        opacity: 1,
        scaleY: 1,
        transformOrigin: 'top center',
      });

      // Wait for title to enter, then fade it out, and only exit overlay
      // after page text animations signal completion (or timeout fallback).
      timeoutRef.current = setTimeout(() => {
        // 1) Ensure title entrance finished
        waitForTitleEnter(expectedTitleEnterMsRef.current).then(() => {
          // 2) Fade out title elements (lines preferred if available)
          const split = overlaySplitRef.current;
          if (split) {
            const fadeNodes = (split.lines && split.lines.length > 0 ? split.lines : split.chars) as Element[] | undefined;
            if (fadeNodes && fadeNodes.length > 0) {
              if (titleAnimationRef.current) {
                titleAnimationRef.current.kill();
              }
              gsap.killTweensOf(fadeNodes);
              gsap.to(fadeNodes, {
                opacity: 0,
                duration: 0.25,
                ease: 'power2.in',
                stagger: 0.02,
              });
            }
          }

          // 3) Wait for page text animations gate, then exit overlay
          waitForGate(1500).then(() => {
            if (animationRef.current) {
              animationRef.current.kill();
            }
    
            animationRef.current = gsap.to(overlay, {
              scaleY: 0,
              opacity: 0,
              duration: OVERLAY_OUT_DURATION,
              ease: 'power2.inOut',
              onComplete: () => {
                gsap.set(overlay, {
                  opacity: 0,
                  scaleY: 0,
                  transformOrigin: 'bottom center',
                  pointerEvents: 'none',
                });
                setIsTransitioning(false);
                setTransitionTitle('');
                animationRef.current = null;
                if (titleAnimationRef.current) {
                  titleAnimationRef.current.kill();
                  titleAnimationRef.current = null;
                }
                if (overlaySplitRef.current) {
                  try { overlaySplitRef.current.revert(); } catch {}
                  overlaySplitRef.current = null;
                }
              },
            });
          });
        });
      }, 400);
    } else if (!isNavigatingRef.current) {
      // Initial load or no transition - only update after mount to avoid hydration issues
      if (isMountedRef.current && displayChildren !== children) {
        setTimeout(() => {
          setDisplayChildren(children);
        }, 0);
      }
      
      gsap.set(overlay, {
        opacity: 0,
        scaleY: 0,
        transformOrigin: 'bottom center',
        pointerEvents: 'none',
      });
      
      timeoutRef.current = setTimeout(() => {
        setIsTransitioning(false);
      }, 0);
    }

    previousPathnameRef.current = pathname;
  }, [pathname, children, displayChildren, waitForTitleEnter]);

  // Mark as mounted after first render (client-side only)
  useEffect(() => {
    isMountedRef.current = true;
  }, []);

  // Animate title when it's set
  useLayoutEffect(() => {
    if (!transitionTitle) return;

    const titleElement = titleRef.current;
    if (!titleElement) return;

    // Kill previous split if any
    if (overlaySplitRef.current) {
      try { overlaySplitRef.current.revert(); } catch {}
      overlaySplitRef.current = null;
    }
    titleEnterDoneRef.current = false;

    // Split and animate: lines if > 2 words, else chars
    const wordCount = transitionTitle.trim().split(/\s+/).filter(Boolean).length;
    const useLines = wordCount > 2;

    // Create split on next frame to ensure DOM has updated text
    requestAnimationFrame(() => {
      const split = new SplitText(titleElement, {
        type: useLines ? 'lines' : 'chars, words, lines',
        linesClass: 'line',
        wordsClass: 'word',
        charsClass: 'char',
        mask: 'lines',
        smartWrap: true,
      });
      overlaySplitRef.current = split;

      const nodes = (useLines ? split.lines : split.chars) as Element[];
      if (!nodes || nodes.length === 0) return;

      gsap.set(nodes, { yPercent: 100, opacity: 0 });
      const duration = useLines ? 1.0 : 1.2;
      const stagger = useLines ? 0.06 : 0.04;
      const delay = 0.5;
      const computedMs = (delay + duration + stagger * nodes.length) * 1000;
      // Clamp to avoid overly long waits
      expectedTitleEnterMsRef.current = Math.max(700, Math.min(2000, Math.round(computedMs)));

      titleAnimationRef.current = gsap.to(nodes, {
        yPercent: 0,
        opacity: 1,
        duration,
        stagger,
        ease: 'power4.out',
        delay,
        onComplete: () => {
          titleEnterDoneRef.current = true;
          if (titleEnterResolverRef.current) {
            titleEnterResolverRef.current();
            titleEnterResolverRef.current = null;
          }
        },
      });
    });
  }, [transitionTitle]);

  // Cleanup on unmount
  useEffect(() => {
    const overlay = overlayRef.current;
    const titleElement = titleRef.current;

    return () => {
      // Clear any pending timeouts
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Kill any running animations
      if (animationRef.current) {
        animationRef.current.kill();
      }
      if (titleAnimationRef.current) {
        titleAnimationRef.current.kill();
      }

      // Kill any tweens on overlay and title
      if (overlay) {
        gsap.killTweensOf(overlay);
      }
      if (titleElement) {
        gsap.killTweensOf(titleElement);
        const chars = titleElement.querySelectorAll('.char');
        gsap.killTweensOf(chars);
      }
    };
  }, []);

  const contextValue = useMemo<TransitionContextValue>(
    () => ({ navigate, isTransitioning }),
    [navigate, isTransitioning]
  );

  return (
    <TransitionContext.Provider value={contextValue}>
      <div className="relative w-full h-full overflow-hidden">
        <div
          ref={overlayRef}
          className="pointer-events-none fixed inset-0 z-9999 bg-black opacity-0 flex items-center justify-center"
          style={{ transformOrigin: 'bottom center' }}
        >
          {transitionTitle && (
            <div
              ref={titleRef}
              className="text-white font-bold text-6xl md:text-8xl lg:text-9xl"
              style={{ 
                fontFamily: 'system-ui, sans-serif',
                letterSpacing: '0.05em',
              }}
            >
              {transitionTitle}
            </div>
          )}
        </div>
        <div className="w-full h-full">
          {displayChildren}
        </div>
      </div>
    </TransitionContext.Provider>
  );
}

type TransitionLinkProps = ComponentProps<typeof Link>;

export const TransitionLink = forwardRef<HTMLAnchorElement, TransitionLinkProps>(
  function TransitionLink({ href, onClick, ...rest }, ref) {
    const { navigate, isTransitioning } = usePageTransition();
    const pathname = usePathname();

    const handleClick: MouseEventHandler<HTMLAnchorElement> = useCallback(
      (event) => {
        onClick?.(event);

        if (
          event.defaultPrevented ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey ||
          event.button !== 0
        ) {
          return;
        }

        event.preventDefault();

        const targetHref =
          typeof href === 'string' ? href : href?.toString() ?? pathname;

        if (!targetHref || targetHref === pathname) {
          return;
        }

        navigate(targetHref);
      },
      [navigate, href, onClick, pathname]
    );

    return (
      <Link
        {...rest}
        ref={ref}
        href={href}
        aria-disabled={isTransitioning ? true : undefined}
        onClick={handleClick}
      />
    );
  }
);
 