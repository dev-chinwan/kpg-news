"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const FALLBACK_SRC = "/images/placeholder.svg";

export default function ImageWithFallback({
  src,
  alt,
  fill,
  sizes,
  width,
  height,
  className,
  priority,
}) {
  const [imgSrc, setImgSrc] = useState(src || FALLBACK_SRC);

  // Re-sync when the article changes (e.g. clicking through to another
  // story reuses this component instance with a new `src`).
  useEffect(() => {
    setImgSrc(src || FALLBACK_SRC);
  }, [src]);

  const commonProps = {
    src: imgSrc,
    alt: alt || "",
    className,
    priority,
    onError: () => setImgSrc(FALLBACK_SRC),
  };

  if (fill) {
    return <Image {...commonProps} fill sizes={sizes} />;
  }

  return (
    <Image
      {...commonProps}
      width={width || 800}
      height={height || 500}
      sizes={sizes}
    />
  );
}
