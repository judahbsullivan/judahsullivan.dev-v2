"use client";

import { useRef } from 'react';
import { tw } from '@/lib/tw';
import { useTextAnimations } from '@/hooks/useTextAnimations';

interface BlockRichTextProps {
  id?: string;
  alignment?: 'left' | 'center' | 'right';
  tagline?: string | null;
  headline?: string | null;
  content?: string | null;
}

const layoutClasses: Record<string, string> = {
  left: 'text-left items-start',
  center: 'text-center items-center',
  right: 'text-right items-end',
};

function BlockRichText({ id, alignment, tagline, headline, content }: BlockRichTextProps) {
  const alignmentClass = layoutClasses[alignment ?? 'left'] ?? layoutClasses.left;
  const richtextRef = useRef<HTMLElement>(null);

  useTextAnimations(
    richtextRef,
    [
      {
        selector: id ? `#${id}` : '#blockrichtext',
        type: 'paragraph',
      },
      {
        selector: '.richtext-tagline',
        type: 'tagline',
      },
      {
        selector: '.richtext-headline',
        type: 'headline',
      },
    ],
    {
      start: 'top 80%',
      once: true,
    },
    [id, tagline, headline, content]
  );

  return (
    <section ref={richtextRef} className="py-16 px-4 md:px-12 bg-white">
      <div className={tw(`max-w-6xl mx-auto flex flex-col gap-8`, alignmentClass)} id={id || 'blockrichtext'}>
        <div className="w-full md:w-1/2 flex flex-col justify-center space-y-6">
          {tagline && (
            <p className="richtext-tagline text-sm text-gray-600 uppercase tracking-wide">
              {tagline}
            </p>
          )}
          {headline && (
            <h1 className="richtext-headline text-6xl font-bold text-gray-900">
              {headline}
            </h1>
          )}
        </div>

        {content && (
          <div
            className="text-lg text-gray-700 prose prose-3xl prose-p:text-2xl"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        )}
      </div>
    </section>
  );
}

export default BlockRichText;
export { BlockRichText };
