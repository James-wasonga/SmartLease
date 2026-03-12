"use client";

import { useState } from "react";

type PropertyImageProps = {
  src: string;
  alt?: string;
  className?: string;
};

const FALLBACK_GATEWAYS = [
  "https://gateway.pinata.cloud",
  "https://ipfs.io",
  "https://cloudflare-ipfs.com",
];

function resolveIpfsUrl(src: string): string {
  if (!src || src.trim() === "") return "/placeholder-property.png";

  if (src.startsWith("http://") || src.startsWith("https://")) {
    return src;
  }

  if (src.startsWith("ipfs://")) {
    const cid = src.replace("ipfs://", "");
    const gateway =
      process.env.NEXT_PUBLIC_GATEWAY_URL?.replace(/\/$/, "") ??
      "https://gateway.pinata.cloud";
    return `${gateway}/ipfs/${cid}`;
  }

  if (src.startsWith("Qm") || src.startsWith("bafy")) {
    const gateway =
      process.env.NEXT_PUBLIC_GATEWAY_URL?.replace(/\/$/, "") ??
      "https://gateway.pinata.cloud";
    return `${gateway}/ipfs/${src}`;
  }

  return src;
}

function buildFallbackUrl(
  originalSrc: string,
  gatewayIndex: number
): string | null {
  if (gatewayIndex >= FALLBACK_GATEWAYS.length) return null;
  const ipfsMatch = originalSrc.match(/\/ipfs\/(.*)/);
  if (ipfsMatch) {
    return `${FALLBACK_GATEWAYS[gatewayIndex]}/ipfs/${ipfsMatch[1]}`;
  }
  return null;
}

const PropertyImage = ({
  src,
  alt = "Property image",
  className = "h-44 w-full object-cover object-center",
}: PropertyImageProps) => {
  const resolvedSrc = resolveIpfsUrl(src);
  const [currentSrc, setCurrentSrc] = useState(resolvedSrc);
  const [fallbackIndex, setFallbackIndex] = useState(0);
  const [failed, setFailed] = useState(false);

  const handleError = () => {
    const nextUrl = buildFallbackUrl(resolvedSrc, fallbackIndex);
    if (nextUrl) {
      setCurrentSrc(nextUrl);
      setFallbackIndex((i) => i + 1);
    } else {
      setFailed(true);
      setCurrentSrc("/placeholder-property.png");
    }
  };

  if (failed) {
    return (
      <div
        className={`${className} bg-gray-200 flex items-center justify-center`}
      >
        <span className="text-gray-400 text-sm">Image unavailable</span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      onError={handleError}
      loading="lazy"
    />
  );
};

export default PropertyImage;