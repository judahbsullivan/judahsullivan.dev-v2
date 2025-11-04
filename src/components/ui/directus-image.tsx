"use client";

import Image from 'next/image';
import { tw } from "@/lib/tw";
import { useEffect, useState } from 'react';
import { getImage, fileUrl, getThumbnail } from "@/directus/queries/file";
import type { DirectusFiles } from "@/directus/utils/types";

interface DirectusImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  image?: DirectusFiles;
  imageId?: string;
  alt?: string;
  width?: number;
  height?: number;
  format?: string;
  className?: string;
  disableMask?: boolean;
  fillContainer?: boolean;
  useSimpleMask?: boolean;
  scrollImage?: boolean;
}

export function DirectusImage({
  image,
  imageId: rawId,
  alt: altProp,
  width: overrideWidth,
  height: overrideHeight,
  className,
  disableMask = false,
  fillContainer = false,
  useSimpleMask = false,
  scrollImage = false,
  ...rest
}: DirectusImageProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageWidth, setImageWidth] = useState<number | undefined>(overrideWidth);
  const [imageHeight, setImageHeight] = useState<number | undefined>(overrideHeight);
  const [alt, setAlt] = useState<string>(altProp ?? image?.description ?? "");
  const [isVisible, setIsVisible] = useState(false);

  const resolvedImageId = rawId ?? image?.id;

  useEffect(() => {
    if (!resolvedImageId) return;

    const loadImage = async () => {
      let width = overrideWidth ?? image?.width ?? undefined;
      let height = overrideHeight ?? image?.height ?? undefined;
      let altText = altProp ?? image?.description ?? "";

      if (width === undefined || height === undefined) {
        try {
          const fetched = await getImage(resolvedImageId);
          width = fetched?.width ?? 1;
          height = fetched?.height ?? 1;
          if (!altText && fetched?.description) altText = fetched.description;
        } catch (error) {
          console.error("Error fetching image:", error);
          width = 1;
          height = 1;
        }
      }

      if (typeof width !== "number" || typeof height !== "number") {
        return;
      }

      setImageWidth(width);
      setImageHeight(height);
      setAlt(altText);

      try {
        const src = await getThumbnail(resolvedImageId, { format: "webp", width, height });
        setImageSrc(src);
      } catch (error) {
        console.error("Error getting thumbnail:", error);
      }
    };

    loadImage();
  }, [resolvedImageId, overrideWidth, overrideHeight, altProp, image]);

  useEffect(() => {
    if (useSimpleMask && !disableMask) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsVisible(true);
            }
          });
        },
        {
          threshold: 0.3,
          rootMargin: '0px 0px -100px 0px'
        }
      );

      const container = document.querySelector('.simple-mask-container');
      if (container) {
        observer.observe(container);
      }

      return () => {
        if (container) {
          observer.unobserve(container);
        }
      };
    }
  }, [useSimpleMask, disableMask]);

  if (!resolvedImageId || !imageSrc || !imageWidth || !imageHeight) {
    return null;
  }

  const maskClass = disableMask 
    ? '' 
    : useSimpleMask 
      ? 'simple-mask' 
      : 'gsap-mask';
  const scrollClass = scrollImage ? 'scroll-container' : '';
  const animateClass = isVisible && useSimpleMask ? 'animate-in' : '';

  if (fillContainer) {
    return (
      <Image
        src={imageSrc}
        alt={alt}
        width={imageWidth}
        height={imageHeight}
        loading="lazy"
        className={tw(className)}
        {...rest}
      />
    );
  }

  return (
    <div className={`directus-image-container overflow-hidden ${maskClass} ${scrollClass} ${animateClass} simple-mask-container`}>
      <Image
        src={imageSrc}
        alt={alt}
        width={imageWidth}
        height={imageHeight}
        loading="lazy"
        className={tw(className)}
        {...rest}
      />
    </div>
  );
}

