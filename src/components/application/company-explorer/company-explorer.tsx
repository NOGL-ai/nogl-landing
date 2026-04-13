'use client';

import React from 'react';
import { ChevronDown, Settings, Download, Eye, Trash2, ExternalLink } from 'lucide-react';

const CompanyExplorer = () => {
  const [searchValue, setSearchValue] = React.useState('');
  const [competitorSearch, setCompetitorSearch] = React.useState('');

  // Featured company logos carousel
  const carouselLogos = [
    'cadenlane.com',
    'awaytravel.com',
    'kytebaby.com',
    'kohls.com',
    'hankypanky.com',
    'poshpeanut.com',
    'malbongolf.com',
    'ruggable.com',
    'misen.com',
    'potterybarn.com',
  ];

  const carouselLogos2 = [
    'vuoriclothing.com',
    'brooklinen.com',
    'kith.com',
    'columbia.com',
    'mejuri.com',
    'fabletics.com',
    'skims.com',
    'wearfigs.com',
    'jared.com',
    'ooni.com',
    'vicicollection.com',
    'stance.com',
  ];

  const carouselLogos3 = [
    'allbirds.com',
    'lululemon.com',
    'bombas.com',
    'everlane.com',
    'warbyparker.com',
    'puma.com',
    'usa.tommy.com',
    'levi.com',
    'fossil.com',
    'gymshark.com',
    'princesspolly.com',
    'nastygal.com',
  ];

  const getLogoUrl = (domain: string) => {
    // Handle special cases
    if (domain === 'malbongolf.com') {
      return 'https://app.particl.com/static-logos/malbongolf.png';
    }
    if (domain === 'lululemon.com') {
      return 'https://app.particl.com/static-logos/lululemon.png';
    }
    return `https://img.logo.dev/${domain}?token=pk_K27XD8FVSGiocHE1CTPcwA`;
  };

  const LogoCarousel = ({ logos }: { logos: string[] }) => (
    <div className="flex overflow-x-hidden relative w-full">
      <div className="animate-scroll flex gap-6 min-w-full">
        {logos.map((logo, idx) => (
          <div
            key={idx}
            className="flex-shrink-0 w-24 h-24 flex items-center justify-center rounded-lg border border-border-secondary bg-white dark:bg-gray-900 p-1"
          >
            <img
              src={getLogoUrl(logo)}
              alt={`Logo for ${logo}`}
              className="max-h-20 max-w-20 object-contain rounded"
              loading="lazy"
            />
          </div>
        ))}
      </div>
      {/* Duplicate for seamless loop */}
      <div className="animate-scroll flex gap-6 min-w-full">
        {logos.map((logo, idx) => (
          <div
            key={`dup-${idx}`}
            className="flex-shrink-0 w-24 h-24 flex items-center justify-center rounded-lg border border-border-secondary bg-white dark:bg-gray-900 p-1"
          >
            <img
              src={getLogoUrl(logo)}
              alt={`Logo for ${logo}`}
              className="max-h-20 max-w-20 object-contain rounded"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-semibold text-foreground">Company Explorer</h2>
          <button
            className="inline-flex items-center gap-2 rounded-md border border-border-secondary bg-background px-3 py-1 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
            aria-label="How to use"
          >
            <svg
              className="h-4 w-4"
              stroke="currentColor"
              fill="currentColor"
              strokeWidth="0"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
            How to use
          </button>
        </div>
        <a
          href="#"
          className="inline-flex items-center gap-2 text-sm font-semibold text-green-600 dark:text-green-400"
        >
          <svg
            className="h-4 w-4"
            stroke="currentColor"
            fill="none"
            strokeWidth="2"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 5h2M5 4v2M11.5 4l-.5 2M18 5h2M19 4v2M15 9l-1 1M18 13l2 -.5M18 19h2M19 18v2M14 16.518l-6.518 -6.518l-4.39 9.58a1 1 0 0 0 1.329 1.329l9.579 -4.39z" />
          </svg>
          234 companies added this month
        </a>
      </div>

      {/* Carousels */}
      <div className="space-y-6">
        <LogoCarousel logos={carouselLogos} />
        <LogoCarousel logos={carouselLogos2} />
        <LogoCarousel logos={carouselLogos3} />
      </div>

      {/* Search and Recently Viewed Section */}
      <div className="space-y-6">
        {/* Search Form */}
        <div className="rounded-lg border border-border-secondary bg-card p-6 space-y-4">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"
              stroke="currentColor"
              fill="none"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0M21 21l-6 -6" />
            </svg>
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search 70k brands..."
              className="w-full rounded-lg border border-border-secondary bg-background pl-10 pr-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
            />
          </div>

          {/* Popular Brands Preview */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Popular brands</span>
            <div className="flex gap-2">
              {['lululemon.com', 'aloyoga.com', 'sonos.com', 'sephora.com', 'puma.com'].map((domain) => (
                <img
                  key={domain}
                  src={getLogoUrl(domain)}
                  alt={domain}
                  className="h-6 w-6 rounded object-contain"
                  loading="lazy"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Recently Viewed Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg
                className="h-4 w-4"
                stroke="currentColor"
                fill="none"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6" />
              </svg>
              <span className="text-sm font-semibold text-foreground">Recently Viewed</span>
            </div>
            <button
              className="p-1 rounded hover:bg-muted transition-colors"
              aria-label="Clear all recently viewed"
            >
              <Trash2 className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          {/* Recently Viewed Item */}
          <a
            href="#"
            className="flex items-center gap-3 rounded-lg border border-border-secondary bg-card p-3 hover:bg-muted transition-colors"
          >
            <button
              className="text-muted-foreground hover:text-foreground"
              aria-label="Remove from recently viewed"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              className="text-muted-foreground hover:text-foreground"
              aria-label="Open external"
            >
              <ExternalLink className="h-4 w-4" />
            </button>
            <div className="h-9 w-9 rounded flex items-center justify-center bg-gray-100 dark:bg-gray-800">
              <img
                src="https://app.particl.com/static-logos/lululemon.png"
                alt="Lululemon logo"
                className="h-8 w-8 object-contain"
              />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-foreground">Lululemon</div>
              <div className="text-xs text-muted-foreground">lululemon.com</div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};

export default CompanyExplorer;
