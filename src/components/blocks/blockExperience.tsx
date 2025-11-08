"use client";

import { useRef, useEffect, useState } from 'react';
import { Section } from '@/components/ui/section';
import { useTextAnimations } from '@/hooks/useTextAnimations';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface Job {
  title?: unknown;
  company?: unknown;
  location?: unknown;
  date?: unknown;
  bullets?: string[];
  link?: string;
}

interface BlockExperienceProps {
  tagline?: string | null;
  headline?: string | null;
  description?: string | null;
  jobs?: Job[];
}


function BlockExperience({ tagline, headline, description, jobs }: BlockExperienceProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const timelineContainerRef = useRef<HTMLDivElement>(null);
  const lastItemRef = useRef<HTMLDivElement>(null);
  const [lineHeight, setLineHeight] = useState<number | null>(null);

  useTextAnimations(
    sectionRef,
    [
      {
        selector: '.experience-tagline',
        type: 'tagline',
      },
      {
        selector: '.experience-headline',
        type: 'headline',
      },
      {
        selector: '.experience-description',
        type: 'description',
      },
    ],
    {
      start: 'top 85%',
      once: true,
    },
    [tagline, headline, description]
  );

  // Animate each timeline item individually as it comes into view
  useGSAP(() => {
    const container = timelineContainerRef.current;
    if (!container) return;

    const timelineItems = container.querySelectorAll('.timeline-item');
    const fillEl = document.getElementById('timeline-fill');
    const dots: Array<{ y: number; inner: HTMLElement; outer: HTMLElement; filled: boolean }> = [];
    
    timelineItems.forEach((item) => {
      const companyEl = item.querySelector('.timeline-company');
      const dateEl = item.querySelector('.timeline-date');
      const titleEl = item.querySelector('.timeline-title');
      const locationEl = item.querySelector('.timeline-location');
      const bulletsEl = item.querySelector('.timeline-bullets');
      const dotInner = item.querySelector('.timeline-dot-inner') as HTMLElement | null;
      const dotOuter = item.querySelector('.timeline-dot') as HTMLElement | null;

      // Set initial states
      if (companyEl) gsap.set(companyEl, { y: 20, autoAlpha: 0 });
      if (dateEl) gsap.set(dateEl, { y: 20, autoAlpha: 0 });
      if (titleEl) gsap.set(titleEl, { y: 20, autoAlpha: 0 });
      if (locationEl) gsap.set(locationEl, { y: 20, autoAlpha: 0 });
      if (bulletsEl) gsap.set(bulletsEl.querySelectorAll('li'), { y: 20, autoAlpha: 0 });
      if (dotInner) gsap.set(dotInner, { scale: 0.8, backgroundColor: '#0a0a0a', backgroundImage: 'none' });
      if (dotOuter) gsap.set(dotOuter, { backgroundImage: 'none' });

      const itemTl = gsap.timeline({
        scrollTrigger: {
          trigger: item,
          start: 'top 85%',
          once: true,
        },
      });

      if (companyEl) {
        itemTl.to(companyEl, { y: 0, autoAlpha: 1, duration: 0.7, ease: 'power2.out' }, 0);
      }
      if (dateEl) {
        itemTl.to(dateEl, { y: 0, autoAlpha: 1, duration: 0.7, ease: 'power2.out' }, 0.1);
      }
      if (titleEl) {
        itemTl.to(titleEl, { y: 0, autoAlpha: 1, duration: 0.8, ease: 'power2.out' }, 0.2);
      }
      if (locationEl) {
        itemTl.to(locationEl, { y: 0, autoAlpha: 1, duration: 0.7, ease: 'power2.out' }, 0.3);
      }
      if (bulletsEl) {
        const bullets = bulletsEl.querySelectorAll('li');
        itemTl.to(bullets, {
          y: 0,
          autoAlpha: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power2.out',
        }, 0.4);
      }
      if (dotInner) {
        itemTl.to(dotInner, {
          scale: 1,
          duration: 0.25,
          ease: 'power1.out',
          backgroundImage: 'linear-gradient(to right, rgba(59,130,246,0.85), rgba(168,85,247,0.85))',
          backgroundColor: 'transparent',
        }, 0.15);
      }
      // register this dot for line-follow fill logic
      if (dotInner && dotOuter) {
        const itemEl = item as HTMLElement;
        const dotY = itemEl.offsetTop + 14; // center of the dot
        dots.push({ y: dotY, inner: dotInner, outer: dotOuter, filled: false });
      }
    });

    // Animate fill line with scroll progress (desktop)
    if (fillEl) {
      const setter = gsap.quickSetter(fillEl, 'height', 'px');
      // Travel distance: up to the last dot center
      const maxDotY = dots.length ? Math.max(...dots.map(d => d.y)) : 0;
      // Nudge up a couple pixels so the fill doesn't visually overshoot the last dot
      const total = (maxDotY ? Math.max(0, maxDotY - 2) : 0) || (typeof lineHeight === 'number' && lineHeight > 0 ? Math.max(0, lineHeight - 2) : 400);
      ScrollTrigger.create({
        trigger: container,
        start: 'top 40%',
        end: `+=${total}`,
        onUpdate: (self) => {
          const h = Math.min(total, total * self.progress);
          setter(h);
          // Fill dots as the line reaches them
          const current = h;
          dots.forEach((d) => {
            if (!d.filled && current >= d.y) {
              d.filled = true;
              gsap.to(d.inner, {
                backgroundImage: 'linear-gradient(to right, rgba(59,130,246,0.95), rgba(168,85,247,0.95))',
                backgroundColor: 'transparent',
                duration: 0.2,
                ease: 'power1.out',
              });
              gsap.to(d.outer, {
                backgroundImage: 'linear-gradient(to bottom, rgba(59,130,246,0.2), rgba(168,85,247,0.2))',
                duration: 0.2,
                ease: 'power1.out',
              });
            } else if (d.filled && current < d.y) {
              // allow reverse when scrolling up
              d.filled = false;
              gsap.to(d.inner, {
                backgroundImage: 'none',
                backgroundColor: '#0a0a0a',
                duration: 0.2,
                ease: 'power1.out',
              });
              gsap.to(d.outer, {
                backgroundImage: 'none',
                duration: 0.2,
                ease: 'power1.out',
              });
            }
          });
        },
      });
    }
    // Animate fill line with scroll progress (mobile on left)
    const fillElMobile = document.getElementById('timeline-fill-mobile');
    if (fillElMobile) {
      const setterMobile = gsap.quickSetter(fillElMobile, 'height', 'px');
      const maxDotY = dots.length ? Math.max(...dots.map(d => d.y)) : 0;
      const totalMobile = (maxDotY ? Math.max(0, maxDotY - 2) : 0) || container.scrollHeight || 400;
      ScrollTrigger.create({
        trigger: container,
        start: 'top 25%',
        end: `+=${totalMobile}`,
        onUpdate: (self) => {
          const h = Math.min(totalMobile, totalMobile * self.progress);
          setterMobile(h);
          dots.forEach((d) => {
            if (!d.filled && h >= d.y) {
              d.filled = true;
              gsap.to(d.inner, {
                backgroundImage: 'linear-gradient(to right, rgba(59,130,246,0.95), rgba(168,85,247,0.95))',
                backgroundColor: 'transparent',
                duration: 0.2,
                ease: 'power1.out',
              });
              gsap.to(d.outer, {
                backgroundImage: 'linear-gradient(to bottom, rgba(59,130,246,0.2), rgba(168,85,247,0.2))',
                duration: 0.2,
                ease: 'power1.out',
              });
            } else if (d.filled && h < d.y) {
              d.filled = false;
              gsap.to(d.inner, {
                backgroundImage: 'none',
                backgroundColor: '#0a0a0a',
                duration: 0.2,
                ease: 'power1.out',
              });
              gsap.to(d.outer, {
                backgroundImage: 'none',
                duration: 0.2,
                ease: 'power1.out',
              });
            }
          });
        },
      });
    }

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => {
        const triggerEl = trigger.vars?.trigger;
        // Check if triggerEl is a Node (Element) before calling contains
        if (triggerEl && triggerEl instanceof Node && container.contains(triggerEl)) {
          trigger.kill();
        }
      });
    };
  }, { scope: timelineContainerRef, dependencies: [jobs, lineHeight] });

  useEffect(() => {
    const calculateLineHeight = () => {
      requestAnimationFrame(() => {
        if (lastItemRef.current && timelineContainerRef.current) {
          const lastItemRect = lastItemRef.current.getBoundingClientRect();
          const containerRect = timelineContainerRef.current.getBoundingClientRect();
          // Get the top position of the last item (where the dot is) and add half the dot size (14px)
          const dotCenter = lastItemRect.top - containerRect.top + 14; // 14px is half of 28px (w-7 h-7)
          setLineHeight(Math.max(dotCenter, 0));
        }
      });
    };

    // Small delay to ensure DOM is rendered
    const timeoutId = setTimeout(calculateLineHeight, 100);
    window.addEventListener('resize', calculateLineHeight);
    window.addEventListener('scroll', calculateLineHeight);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', calculateLineHeight);
      window.removeEventListener('scroll', calculateLineHeight);
    };
  }, [jobs]);

  return (
    <Section
      ref={sectionRef}
      id="block-list"
      fullWidth
      className="flex flex-col gap-12 px-6 pt-24 text-pretty text-left"
    >
      <div className="w-full text-left flex flex-col items-start">
        <h2 className="experience-tagline text-left text-xl relative uppercase tracking-wider text-neutral-600 mb-1">
          {tagline}
        </h2>
        <h3 className="experience-headline text-left text-5xl md:text-[5vw] uppercase font-light leading-tight tracking-tighter overflow-hidden">
          {headline}
        </h3>
        <div className="flex gap-6 text-left items-start w-full flex-wrap mt-5 max-w-2xl justify-start">
          <p className="experience-description text-2xl  font-thin">
            {description}
          </p>
        </div>
      </div>

      <div ref={timelineContainerRef} className="relative max-w-7xl mx-auto w-full pl-8 pr-4 md:px-0">
        {/* Timeline line - stops at last dot (desktop) */}
        {lineHeight !== null && (
          <div 
            className="absolute left-1/2 top-0 w-px border-l-2 border-dashed border-neutral-300 hidden md:block transform -translate-x-1/2"
            style={{
              height: `${lineHeight}px`
            }}
          />
        )}
        {/* Gradient fill line (animated) */}
        {lineHeight !== null && (
          <div 
            id="timeline-fill"
            className="absolute left-1/2 top-0 hidden md:block transform -translate-x-1/2 w-[3px] rounded-full overflow-hidden"
            style={{
              height: '0px',
              backgroundImage: 'linear-gradient(to bottom, rgba(59,130,246,0.25), rgba(168,85,247,0.25))'
            }}
          />
        )}
        {/* Mobile background line (left side) */}
        <div className="absolute left-2 top-0 bottom-0 w-[2px] bg-neutral-300/60 rounded-full md:hidden" />
        {/* Mobile gradient fill line */}
        <div
          id="timeline-fill-mobile"
          className="absolute left-2 top-0 w-[2px] rounded-full md:hidden"
          style={{
            height: '0px',
            backgroundImage: 'linear-gradient(to bottom, rgba(59,130,246,0.25), rgba(168,85,247,0.25))'
          }}
        />
        
        <div className="relative">
          {jobs?.map((job, index) => {
            const jobId = `job-${index}`;
            const isEven = index % 2 === 0;
            const isLast = index === (jobs?.length || 0) - 1;
            
            return (
              <div 
                key={index} 
                id={jobId} 
                ref={isLast ? lastItemRef : null}
                className="timeline-item relative mb-24 md:mb-28"
              >
                {/* Mobile timeline dot (left side) */}
                <div className="absolute top-0 -left-7.5 md:hidden z-10">
                  <div className="timeline-dot relative w-4 h-4 rounded-full border-2 border-dashed border-neutral-300 bg-white flex items-center justify-center">
                    <div className="timeline-dot-inner w-2 h-2 rounded-full bg-neutral-900" />
                  </div>
                </div>
                {/* Timeline bullet - centered on the line (desktop) */}
                <div className="absolute top-0 left-1/2 hidden md:block transform -translate-x-1/2 z-10">
                  <div className="timeline-dot relative w-7 h-7 rounded-full border-2 border-dashed border-neutral-300 bg-white flex items-center justify-center">
                    <div className="timeline-dot-inner w-2.5 h-2.5 rounded-full bg-neutral-900" />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-start">
                  {/* Company/Date Section */}
                  <div className={`duration text-left ${isEven ? 'date-label-left md:text-right md:pr-6' : 'duration-right md:text-left md:pl-6 md:order-2'} relative`}>
                    <div className="mb-4">
                      <h5 className="timeline-company text-2xl md:text-3xl font-semibold mb-2">
                        {String(job.company || '')}
                      </h5>
                      <small className="timeline-date text-neutral-600 text-base">
                        {String(job.date || '')}
                      </small>
                    </div>
                  </div>

                  {/* Description Section */}
                  <div className={`event text-left ${isEven ? 'event-description-right md:pl-6' : 'event-description-left md:pr-6 md:order-1'} ${isEven ? 'md:text-left' : 'md:text-right'}`}>
                    <h6 className="timeline-title title text-xl md:text-2xl font-semibold mb-2 capitalize">
                      {String(job.title || '')}
                    </h6>
                    {(() => {
                      const location = String(job.location || '');
                      return location ? (
                        <p className="timeline-location text-neutral-600 text-sm mb-4">
                          {location}
                        </p>
                      ) : null;
                    })()}
                    {job.bullets && job.bullets.length > 0 && (
                      <ul
                        className={`timeline-bullets desc-text space-y-2 mb-4 ${
                          isEven
                            ? 'list-disc list-inside text-left'
                            : 'list-disc list-inside text-left md:list-none md:text-right'
                        }`}
                      >
                        {job.bullets.map((point, idx) => (
                          <li
                            key={idx}
                            className={`text-base ${
                              !isEven
                                ? 'md:after:content-["•"] md:after:ml-2 md:after:inline-block'
                                : ''
                            }`}
                          >
                            {point}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}

export default BlockExperience;
export { BlockExperience };
