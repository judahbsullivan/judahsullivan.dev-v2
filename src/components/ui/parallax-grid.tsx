"use client";

import { useRef } from 'react';
import { DirectusImage } from './directus-image';
import { Link } from './link';
import { PillLink } from './pill-link';
import Image from 'next/image';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitText from 'gsap/SplitText';
import { tw } from '@/lib/tw';

gsap.registerPlugin(ScrollTrigger, SplitText);

type CardItem = {
  slug?: string | null;
  title?: string | null;
  description?: string | null;
  image?: string | null;
  published_at?: string | null;
};

interface ParallaxGridProps {
  posts: CardItem[];
  className?: string;
  base?: string;
}

export function ParallaxGrid({ posts, className, base = 'blog' }: ParallaxGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Kill any existing ScrollTriggers for this component to prevent conflicts
    ScrollTrigger.getAll().forEach((trigger) => {
      if (trigger.vars.id && typeof trigger.vars.id === 'string' && trigger.vars.id.startsWith("parallax-")) {
        trigger.kill();
      }
    });

    const parallaxItems = gridRef.current?.querySelectorAll(".parallax-item");
    if (!parallaxItems || parallaxItems.length === 0) return;

    // Wait for images to load before initializing animations
    const initializeAnimations = () => {
      parallaxItems.forEach((item, index) => {
        const imageContainer = item.querySelector(".parallax-container");
        const content = item.querySelector(".parallax-content");
        // Find the actual img element (could be img tag or Next.js Image component)
        const imageWrapper = item.querySelector(".parallax-image-wrapper");
        const image = imageWrapper?.querySelector("img") || item.querySelector(".parallax-image");

        if (!imageContainer || !content || !image) {
          return;
        }

        // Set initial state - container starts as mask, image starts scaled up
        // Ensure everything starts hidden to prevent flicker
        gsap.set(imageContainer, { clipPath: "inset(100% 0% 0% 0%)", opacity: 0 });
        gsap.set(image, { scale: 1.2, y: 20, opacity: 0 });
        gsap.set(content, { opacity: 0 });

        // Container mask reveals from top to bottom using clipPath
        gsap.fromTo(
          imageContainer,
          { clipPath: "inset(100% 0% 0% 0%)", opacity: 0 },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            opacity: 1,
            duration: 1.2,
            ease: "power3.out",
            scrollTrigger: {
              id: `parallax-container-${index}`,
              trigger: item,
              start: "top 70%",
              end: "bottom 30%",
              scrub: false,
            },
          },
        );

        // Image scales down from 1.2 to 1 and fades in
        const imageTimeline = gsap.timeline({
          scrollTrigger: {
            id: `parallax-image-${index}`,
            trigger: item,
            start: "top 70%",
            end: "bottom 30%",
            scrub: false,
          },
        });
        imageTimeline
          .to(image, {
            scale: 1,
            opacity: 1,
            duration: 1.0,
            ease: "power3.out",
            delay: 0.3,
          })
          .call(() => {
            setTimeout(() => {
              gsap.to(content, { opacity: 1, duration: 0.5 });
            }, 500);
          });

        // Container acts as mask - image slides through it after reveal
        gsap.to(image, {
          y: -15,
          ease: "none",
          scrollTrigger: {
            id: `parallax-effect-${index}`,
            trigger: item,
            start: "top 70%",
            end: "bottom top",
            scrub: 1,
          },
          delay: 1.5,
        });

        // Content reveal animations
        const title = content.querySelector(".parallax-title");
        const description = content.querySelector(".parallax-description");

        if (title) {
          const splitTitle = new SplitText(title, {
            type: "chars, words, lines",
            lineClass: "line++",
            wordsClass: "word++",
            charsClass: "char++",
            mask: "lines",
            smartWrap: true,
          });

          gsap.set(splitTitle.chars, { yPercent: 100, opacity: 0 });

          gsap.to(splitTitle.chars, {
            yPercent: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.03,
            ease: "power4.out",
            delay: 1.4,
            scrollTrigger: {
              trigger: item,
              start: "top 80%",
              end: "bottom 20%",
              scrub: false,
            },
          });
        }

        if (description) {
          const splitDescription = new SplitText(description, {
            type: "lines, words",
            lineClass: "line++",
            charsClass: "char++",
            mask: "lines",
          });

          gsap.set(splitDescription.lines, { yPercent: 100, opacity: 0 });

          gsap.to(splitDescription.lines, {
            yPercent: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.05,
            ease: "power4.out",
            delay: 1.6,
            scrollTrigger: {
              trigger: item,
              start: "top 80%",
              end: "bottom 20%",
              scrub: false,
            },
          });
        }

        // Enhanced hover bubble animation
        const bubble = imageContainer.querySelector(".hover-bubble");
        const clickableOverlay = imageContainer.querySelector(".clickable-overlay");
        
        if (bubble) {
          const handleMouseMove = (e: Event) => {
            const mouseEvent = e as MouseEvent;
            const rect = imageContainer.getBoundingClientRect();
            const x = mouseEvent.clientX - rect.left;
            const y = mouseEvent.clientY - rect.top;

            gsap.killTweensOf(bubble);
            
            gsap.to(bubble, {
              x: x - 50,
              y: y - 20,
              scale: 1.2,
              opacity: 1,
              duration: 0.2,
              ease: "power1.out",
            });
          };

          const handleMouseLeave = () => {
            gsap.to(bubble, {
              opacity: 0,
              scale: 0.8,
              duration: 0.2,
              ease: "power1.out",
            });
          };

          imageContainer.addEventListener("mousemove", handleMouseMove);
          imageContainer.addEventListener("mouseleave", handleMouseLeave);

          // Click feedback animation
          if (clickableOverlay) {
            const handleClick = (e: Event) => {
              const mouseEvent = e as MouseEvent;
              const ripple = document.createElement("div");
              ripple.className = "ripple-effect";
              ripple.style.cssText = `
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.3);
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
                z-index: 10;
              `;
              
              const rect = clickableOverlay.getBoundingClientRect();
              const size = Math.max(rect.width, rect.height);
              const x = mouseEvent.clientX - rect.left - size / 2;
              const y = mouseEvent.clientY - rect.top - size / 2;
              
              ripple.style.width = ripple.style.height = size + "px";
              ripple.style.left = x + "px";
              ripple.style.top = y + "px";
              
              clickableOverlay.appendChild(ripple);
              
              setTimeout(() => {
                if (ripple.parentNode) {
                  ripple.parentNode.removeChild(ripple);
                }
              }, 600);
            };

            clickableOverlay.addEventListener("click", handleClick);

            return () => {
              imageContainer.removeEventListener("mousemove", handleMouseMove);
              imageContainer.removeEventListener("mouseleave", handleMouseLeave);
              clickableOverlay.removeEventListener("click", handleClick);
            };
          }

          return () => {
            imageContainer.removeEventListener("mousemove", handleMouseMove);
            imageContainer.removeEventListener("mouseleave", handleMouseLeave);
          };
        }
    });

    // Refresh ScrollTrigger after animations are set up
    ScrollTrigger.refresh();
    };

    // Check if images are already loaded or wait for them
    const checkImagesLoaded = () => {
      const images = gridRef.current?.querySelectorAll(".parallax-image-wrapper img");
      
      // If no images found, try initializing anyway after a delay
      // (might be DirectusImage component loading async)
      if (!images || images.length === 0) {
        setTimeout(() => {
          // Try one more time after delay
          const retryImages = gridRef.current?.querySelectorAll(".parallax-image-wrapper img");
          if (retryImages && retryImages.length > 0) {
            checkImagesLoaded();
          } else {
            // Initialize anyway - elements might be ready
            initializeAnimations();
          }
        }, 300);
        return;
      }

      let loadedCount = 0;
      const totalImages = images.length;

      images.forEach((img) => {
        const imgElement = img as HTMLImageElement;
        if (imgElement.complete && imgElement.naturalWidth > 0) {
          loadedCount++;
        } else {
          imgElement.addEventListener("load", () => {
            loadedCount++;
            if (loadedCount === totalImages) {
              initializeAnimations();
            }
          }, { once: true });
          imgElement.addEventListener("error", () => {
            loadedCount++;
            if (loadedCount === totalImages) {
              initializeAnimations();
            }
          }, { once: true });
        }
      });

      // If all images are already loaded
      if (loadedCount === totalImages) {
        initializeAnimations();
      }
    };

    // Initialize after a short delay to ensure DOM is ready
    setTimeout(() => {
      checkImagesLoaded();
    }, 100);

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.vars.id && typeof trigger.vars.id === 'string' && trigger.vars.id.startsWith("parallax-")) {
          trigger.kill();
        }
      });
    };
  }, { scope: gridRef, dependencies: [posts] });

  // Ensure consistent className merging to avoid hydration mismatches
  const classes = tw(
    'space-y-4 md:space-y-8 grid grid-cols-1 md:grid-cols-2 gap-10 w-full px-4 md:px-6',
    className
  );
  
  return (
    <div ref={gridRef} className={classes}>
        {posts.map((post, index) => (
          <div key={post.slug || index} className="parallax-item relative" data-index={index}>
            <div className="parallax-container relative w-full max-w-4xl mx-auto aspect-video overflow-hidden rounded-sm mb-4">
              {post.image && (
                <div className="parallax-image-wrapper absolute inset-0 w-full h-full">
                  {post.image.startsWith('http') ? (
                    <Image
                      src={post.image}
                      alt={post.title || 'Post image'}
                      className="parallax-image w-[102%] md:w-[105%] h-[102%] md:h-[105%] object-cover"
                      width={1200}
                      height={675}
                      loading="lazy"
                    />
                  ) : (
                    <DirectusImage
                      imageId={post.image}
                      alt={post.title || 'Post image'}
                      className="parallax-image aspect-video object-center w-[102%] md:w-[105%] h-[102%] object-cover"
                    />
                  )}
                  
                  <Link href={`/${base}/${post.slug}`} className="clickable-overlay absolute inset-0 z-10 block">
                    <span className="sr-only">View {post.title}</span>
                  </Link>
                </div>
              )}
              
              <div className="hover-bubble absolute w-fit h-12 flex items-center justify-center bg-black/90 text-white px-4 py-2 md:px-6 md:py-3 rounded-full text-sm md:text-base font-medium opacity-0 pointer-events-none z-10 shadow-lg">
                Read this {base === 'projects' ? 'Project' : 'Post'}
              </div>
            </div>
            
            <div className="parallax-content text-left max-w-4xl mx-auto">
              <h3 className="parallax-title text-lg md:text-2xl lg:text-3xl font-bold mb-2 md:mb-4 text-gray-900">
                {post.title}
              </h3>
              <p className="parallax-description text-sm md:text-base lg:text-lg mb-3 md:mb-6 text-gray-600 line-clamp-2 md:line-clamp-3">
                {post.description}
              </p>
              <PillLink 
                href={`/${base}/${post.slug}`} 
                className="parallax-link"
                aria-label={post.title ? `Read more about ${post.title}` : `Read more ${base}`}
              >
                {post.title ? `Read More: ${post.title}` : 'Read More'}
              </PillLink>
            </div>
          </div>
        ))}
      </div>
  );
}
