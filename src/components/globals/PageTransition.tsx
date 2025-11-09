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

      // Animate title out first
      const titleElement = titleRef.current;
      if (titleElement) {
        const chars = titleElement.querySelectorAll('.char');
        if (chars.length > 0) {
          // Kill existing animation
          if (titleAnimationRef.current) {
            titleAnimationRef.current.kill();
          }
          gsap.killTweensOf(chars);
          
          // Exit animation - move down and fade out
          gsap.to(chars, {
            yPercent: 100,
            opacity: 0,
            duration: 0.25,
            ease: 'power4.inOut', // Smooth ease without bounce
            stagger: 0.02,
          });
        }
      }

      // Wait longer for container to fully change, then exit overlay
      timeoutRef.current = setTimeout(() => {
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
          },
        });
      }, 200);
    } else if (!isNavigatingRef.current) {
      // Initial load or no transition - update children and hide overlay
      requestAnimationFrame(() => {
        setDisplayChildren(children);
      });
      
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
  }, [pathname, children]);

  // Animate title when it's set
  useLayoutEffect(() => {
    if (!transitionTitle) return;

    const titleElement = titleRef.current;
    if (!titleElement) return;

      // Wait for DOM to update with new title
      requestAnimationFrame(() => {
        const chars = titleElement.querySelectorAll('.char');
        if (chars.length > 0) {
          // Kill any existing animations first
          if (titleAnimationRef.current) {
            titleAnimationRef.current.kill();
          }
          gsap.killTweensOf(chars);

          // Reset all chars - start from below
          gsap.set(chars, {
            yPercent: 100,
            opacity: 0,
          });

          // Mask animation from Y axis - no bounce, smooth reveal
          titleAnimationRef.current = gsap.to(chars, {
            yPercent: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.04,
            ease: 'power1.out', // Smooth ease without bounce
            delay: OVERLAY_IN_DURATION * 0.4, // Start animation partway through overlay
          });
        }
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
    <TransitionContext.Provider value={contextValue} >
      <div className="relative w-full h-full overflow-hidden" suppressHydrationWarning>
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
              {transitionTitle.split('').map((char, index) => (
                <span
                  key={index}
                  className="char inline-block"
                  style={{
                    transform: 'translateY(100%)',
                    opacity: 0,
                  }}
                >
                  {char === ' ' ? '\u00A0' : char}
                </span>
              ))}
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
 