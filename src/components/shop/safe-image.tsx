"use client";

import NextImage, { type ImageProps } from "next/image";
import { useState } from "react";

interface SafeImageProps extends Omit<ImageProps, "onError"> {
  /** Override the default "ללא תמונה" fallback. */
  fallback?: React.ReactNode;
}

const DEFAULT_FALLBACK = (
  <div className="absolute inset-0 flex items-center justify-center text-ink-soft/30 text-[10px] tracking-widest uppercase font-light bg-cream/40">
    ללא תמונה
  </div>
);

/**
 * Drop-in replacement for next/image that swallows load errors and renders a
 * branded placeholder instead of the browser's default broken-image icon.
 * Use anywhere remote URLs may 404, get blocked by next/image optimization,
 * or fail for any other reason — keeps the visual rhythm intact.
 */
export function SafeImage({ fallback = DEFAULT_FALLBACK, alt, ...props }: SafeImageProps) {
  const [errored, setErrored] = useState(false);
  if (errored || !props.src) return <>{fallback}</>;
  return (
    <NextImage
      {...props}
      alt={alt}
      onError={() => setErrored(true)}
    />
  );
}
