'use client';

import React, { useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { Squares2X2Icon } from '@heroicons/react/24/outline';
import { Route } from 'next';
import { SessionWithExpert } from '@/types/session';

interface ImageGalleryModalProps {
  session: SessionWithExpert;
}

const ImageGalleryGrid: React.FC<ImageGalleryModalProps> = ({ session }) => {
  const router = useRouter();
  const pathname = usePathname();

  // Generate the image gallery
  const sessionImageGallery = useMemo(() => {
    if (!session || !session.expert) return [];

    const allImages = [
      session.expert.image || '/images/default-avatar.jpg',
      ...(session.galleryImages || [])
    ];

    return allImages.map((url, index) => ({
      id: index,
      url: url || '/images/default-session.jpg',
    }));
  }, [session]);

  // Handler for opening the modal
  const handleOpenModalImageGallery = () => {
    router.push(`${pathname}/?modal=PHOTO_TOUR_SCROLLABLE&images=${encodeURIComponent(
      JSON.stringify(sessionImageGallery)
    )}` as Route);
  };

  return (
    <div className="relative grid grid-cols-3 gap-1 sm:grid-cols-4 sm:gap-2">
      {/* Main Image */}
      <div
        className="relative col-span-2 row-span-3 cursor-pointer overflow-hidden rounded-md sm:row-span-2 sm:rounded-xl"
        onClick={handleOpenModalImageGallery}
      >
        <div className="aspect-h-3 aspect-w-4 sm:aspect-h-5 sm:aspect-w-6">
          <Image
            fill
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover rounded-md sm:rounded-xl"
            src={session.expert.image || '/images/default-avatar.jpg'}
            alt={`${session.expert.name}'s profile picture`}
          />
        </div>
        <div className="absolute inset-0 bg-neutral-900 bg-opacity-20 opacity-0 transition-opacity hover:opacity-100"></div>
      </div>

      {/* Gallery Images */}
      {(session.galleryImages || []).map((imageUrl, index) => (
        <div
          key={index}
          className={`relative overflow-hidden rounded-md sm:rounded-xl ${
            index >= 3 ? 'hidden sm:block' : ''
          }`}
        >
          <div className="aspect-h-3 aspect-w-4 sm:aspect-h-5 sm:aspect-w-6">
            <Image
              fill
              loading="lazy"
              sizes="(max-width: 768px) 33vw, 25vw"
              className="object-cover rounded-md sm:rounded-xl"
              src={imageUrl || '/images/default-session.jpg'}
              alt={`Gallery image ${index + 1} for ${session.title}`}
            />
          </div>
          <div
            className="absolute inset-0 cursor-pointer bg-neutral-900 bg-opacity-20 opacity-0 transition-opacity hover:opacity-100"
            onClick={handleOpenModalImageGallery}
          />
        </div>
      ))}

      {/* Show All Photos Button */}
      <button
        className="absolute bottom-3 left-3 z-10 hidden rounded-xl bg-neutral-100 px-4 py-2 text-neutral-500 hover:bg-neutral-200 md:flex md:items-center md:justify-center"
        onClick={handleOpenModalImageGallery}
      >
        <Squares2X2Icon className="h-5 w-5" />
        <span className="ml-2 text-sm font-medium text-neutral-800">
          Show all photos ({(session.galleryImages || []).length + 1})
        </span>
      </button>
    </div>
  );
};

export default ImageGalleryGrid;
