"use client";

import { useState, useRef } from 'react';
import { Section } from '@/components/ui/section';
import { useTextAnimations } from '@/hooks/useTextAnimations';
import type { Forms, FormFields } from '@/directus/utils/types';

interface BlockFormProps {
  meta_header_block_form?: string | null;
  tagline?: string | null;
  headline?: string | null;
  form?: Forms | null;
}

function BlockForm({ meta_header_block_form, tagline, headline, form }: BlockFormProps) {
  const layoutIsValid = form?.is_active && form.fields?.length;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const formRef = useRef<HTMLElement>(null);

  useTextAnimations(
    formRef,
    [
      {
        selector: '.form-tagline',
        type: 'tagline',
      },
      {
        selector: '.form-headline',
        type: 'headline',
      },
      {
        selector: '#blockform',
        type: 'paragraph',
        position: 0.3,
      },
    ],
    {
      start: 'top 80%',
      once: true,
    },
    [tagline, headline, form]
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formElement = e.currentTarget;
    const formData = new FormData(formElement);
    const values = Object.fromEntries(formData.entries());

    setIsSubmitting(true);

    // Disable the submit button
    const button = formElement.querySelector<HTMLButtonElement>('button[type="submit"]');
    if (button) {
      button.disabled = true;
      button.textContent = "Submitting...";
    }

    // Simulate async (replace with real fetch/axios if needed)
    await new Promise((res) => setTimeout(res, 1000));

    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  if (!layoutIsValid) {
    return null;
  }

  return (
    <Section ref={formRef} id="blockform" className="py-12 w-full">
      <div className="px-4 text-center">
        {meta_header_block_form && (
          <span className="text-sm font-semibold text-indigo-600 uppercase">
            {meta_header_block_form}
          </span>
        )}
        <div className="text-left">
          {tagline && (
            <p className="form-tagline text-sm text-gray-500 uppercase tracking-wide">
              {tagline}
            </p>
          )}
          {headline && (
            <h1 className="form-headline text-5xl md:text-5xl lg:text-6xl xl:text-8xl leading-tight tracking-tight text-gray-900 overflow-hidden">
              {headline}
            </h1>
          )}
        </div>
        {!isSubmitted ? (
          <form id="blockform" onSubmit={handleSubmit} className="mt-8 space-y-6 text-left">
          {form.fields?.map((field: FormFields) => {
            const { id, label, name, placeholder, required, type } = field;
            if (!name) return null;

            const isRequired = required ?? false;

            return (
              <div key={id} id={id}>
                {label && (
                  <label htmlFor={name} className="block text-sm font-medium mb-1">
                    {label}
                  </label>
                )}
                {type === 'textarea' ? (
                  <textarea
                    id={name}
                    name={name}
                    placeholder={placeholder ?? ''}
                    required={isRequired}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2"
                    rows={4}
                  />
                ) : (
                  <input
                    type="text"
                    id={name}
                    name={name}
                    placeholder={placeholder ?? ''}
                    required={isRequired}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                )}
              </div>
            );
          })}

          <button
            type="submit"
              disabled={isSubmitting}
            className="flex mt-14 capitalize px-16 py-20 md:px-22 md:py-28 text-pretty bg-gray-900/50 rounded-full text-white font-medium hover:bg-gray-900/90 transition text-2xl justify-self-center"
          >
              {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </form>
        ) : (
          <p id="form-success" className="mt-8 text-green-600 text-lg">
          {form.success_message ?? 'Thank you for submitting the form.'}
        </p>
        )}
      </div>
    </Section>
  );
}

export default BlockForm;
export { BlockForm };
