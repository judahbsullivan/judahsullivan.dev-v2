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
    
    timelineItems.forEach((item) => {
      const companyEl = item.querySelector('.timeline-company');
      const dateEl = item.querySelector('.timeline-date');
      const titleEl = item.querySelector('.timeline-title');
      const locationEl = item.querySelector('.timeline-location');
      const bulletsEl = item.querySelector('.timeline-bullets');

      // Set initial states
      if (companyEl) gsap.set(companyEl, { y: 20, autoAlpha: 0 });
      if (dateEl) gsap.set(dateEl, { y: 20, autoAlpha: 0 });
      if (titleEl) gsap.set(titleEl, { y: 20, autoAlpha: 0 });
      if (locationEl) gsap.set(locationEl, { y: 20, autoAlpha: 0 });
      if (bulletsEl) gsap.set(bulletsEl.querySelectorAll('li'), { y: 20, autoAlpha: 0 });

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
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => {
        const triggerEl = trigger.vars?.trigger as Element | undefined;
        if (triggerEl && container.contains(triggerEl)) {
          trigger.kill();
        }
      });
    };
  }, { scope: timelineContainerRef, dependencies: [jobs] });

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
      className="flex flex-col gap-12 px-6 py-52 text-pretty"
    >
      <header className="w-full text-center">
        <h2 className="experience-tagline text-xl relative uppercase tracking-wider text-neutral-600 mb-1">
          {tagline}
        </h2>
        <h3 className="experience-headline text-5xl md:text-[5vw] uppercase font-light leading-tight tracking-tighter overflow-hidden">
          {headline}
        </h3>
        <div className="flex gap-6 flex-wrap mt-5 max-w-2xl mx-auto justify-center">
          <p className="experience-description text-2xl font-thin">
            {description}
          </p>
        </div>
      </header>

      <div ref={timelineContainerRef} className="relative max-w-7xl mx-auto w-full px-4 md:px-0">
        {/* Timeline line - stops at last dot */}
        {lineHeight !== null && (
          <div 
            className="absolute left-1/2 top-0 w-px border-l-2 border-dashed border-neutral-300 hidden md:block transform -translate-x-1/2"
            style={{
              height: `${lineHeight}px`
            }}
          />
        )}
        
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
                className="timeline-item relative mb-16 md:mb-20"
              >
                {/* Timeline bullet - centered on the line */}
                <div className="absolute top-0 left-1/2 hidden md:block transform -translate-x-1/2 z-10">
                  <div className="relative w-7 h-7 rounded-full border-2 border-dashed border-neutral-300 bg-white flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-neutral-900" />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 items-start">
                  {/* Company/Date Section */}
                  <div className={`duration ${isEven ? 'date-label-left md:text-right md:pr-6' : 'duration-right md:text-left md:pl-6 md:order-2'} relative`}>
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
                  <div className={`event ${isEven ? 'event-description-right md:pl-6' : 'event-description-left md:pr-6 md:order-1'} ${isEven ? 'md:text-left' : 'md:text-right'}`}>
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
                      <ul className={`timeline-bullets desc-text space-y-2 mb-4 ${isEven ? 'pl-6 text-left list-disc' : 'pr-6 text-right'}`}>
                        {job.bullets.map((point, idx) => (
                          <li key={idx} className={`text-base ${!isEven ? 'md:before:content-["•_"] md:before:mr-1' : ''}`}>{point}</li>
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
