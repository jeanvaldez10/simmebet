'use client';

import Image from 'next/image';
import Link from 'next/link';

interface GameCardProps {
  href: string;
  imageSrc: string;
  alt: string;
  playButtonText?: string;
}

export function GameCard({
  href,
  imageSrc,
  alt,
  playButtonText = 'Play',
}: GameCardProps) {
  return (
    <Link href={href} className="group">
      <div className="relative overflow-hidden rounded-2xl">
        {/* Card Image */}
        <div className="relative w-full aspect-[1700/1920] overflow-hidden">
          <Image
            src={imageSrc}
            alt={alt}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, (max-width: 1536px) 25vw, 16vw"
          />

          {/* Play Button - Slides up from bottom */}
          <div className="absolute bottom-0 left-0 right-0 z-20 px-4 pb-6 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out">
            <div className="bg-white text-black font-bold py-3 w-full text-center rounded-full text-lg shadow-lg">
              {playButtonText}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

