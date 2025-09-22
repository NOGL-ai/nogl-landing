import type { Metadata } from "next";

// Define allowed OpenGraph types
type OpenGraphType =
  | 'article'
  | 'website'
  | 'book'
  | 'profile'
  | 'music.song'
  | 'music.album'
  | 'music.playlist'
  | 'music.radio_station'
  | 'video.movie'
  | 'video.episode'
  | 'video.tv_show'
  | 'video.other';

// Define the structure for SEO properties
interface SEOProps {
  title: string;
  description: string;
  canonicalUrlRelative?: string;
  image?: string;
  type?: OpenGraphType;
  locale?: string;
  siteName?: string;
}

// Helper function to safely construct URLs
const constructUrl = (path: string, base: string): string => {
  try {
    // Remove leading slash if present to avoid double slashes
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return new URL(cleanPath, base).toString();
  } catch (error) {
    console.error(`Error constructing URL: ${error}`);
    return base;
  }
};

// Helper function to validate and construct image URL
const getImageUrl = (imagePath: string, baseUrl: string): string => {
  if (!imagePath) {
    return `${baseUrl}/og-image.png`; // Default fallback image
  }

  try {
    if (imagePath.startsWith('http')) {
      new URL(imagePath); // Validate URL format
      return imagePath;
    }
    return constructUrl(imagePath, baseUrl);
  } catch (error) {
    console.error(`Error processing image URL: ${error}`);
    return `${baseUrl}/og-image.png`; // Fallback to default image
  }
};

// Function to generate SEO tags
export const getSEOTags = ({
  title,
  description,
  canonicalUrlRelative,
  image,
  type = 'website',
  locale = 'en_US',
  siteName,
}: SEOProps): Metadata => {
  const defaultSiteUrl = process.env.SITE_URL || 'https://www.nogl.ai';
  const defaultSiteName = process.env.SITE_NAME || 'Nogl';
  const defaultImageBaseUrl = process.env.NEXT_PUBLIC_IMAGE_URL || defaultSiteUrl;
  const defaultImageUrl = `${defaultImageBaseUrl}/og-image.png`;

  return {
    title,
    description,
    metadataBase: new URL(defaultSiteUrl),
    // Basic metadata
    robots: {
      follow: true,
      index: true,
    },
    // Canonical URL
    alternates: {
      canonical: canonicalUrlRelative
        ? constructUrl(canonicalUrlRelative, defaultSiteUrl)
        : defaultSiteUrl,
    },
    // OpenGraph
    openGraph: {
      title: title || defaultSiteName,
      description: description || 'AI-Powered Expert Sessions',
      url: canonicalUrlRelative
        ? constructUrl(canonicalUrlRelative, defaultSiteUrl)
        : defaultSiteUrl,
      siteName: siteName || defaultSiteName,
      images: [
        {
          url: getImageUrl(
            image || defaultImageUrl,
            defaultImageBaseUrl
          ),
          width: 1200,
          height: 630,
          alt: title || 'Page Image',
          type: 'image/png',
        },
      ],
      locale: locale || 'en_US',
      type: type || 'website',
      // Removed 'publisher' property to fix TypeScript error
      // If you need to include authors, ensure it matches the OpenGraph type specifications
    },
    // Twitter
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [
        image && image.startsWith('http')
          ? image
          : getImageUrl(image || defaultImageUrl, defaultImageBaseUrl),
      ],
      creator: '@nogl_ai',
      site: '@nogl_ai',
    },
  };
};

// Function to render structured data (JSON-LD)
export const renderSchemaTags = (customSchema?: Record<string, any>) => {
  const defaultSiteUrl = process.env.SITE_URL || 'https://www.nogl.ai';
  const defaultSiteName = process.env.SITE_NAME || 'Nogl';
  const defaultImageBaseUrl = process.env.NEXT_PUBLIC_IMAGE_URL || defaultSiteUrl;

  // Default schema data for Software Application
  const defaultSchema = {
    '@context': 'http://schema.org',
    '@type': 'SoftwareApplication',
    name: defaultSiteName,
    description: 'Nogl - AI-Powered Expert Sessions',
    image: `${defaultImageBaseUrl}/icon.png`,
    url: defaultSiteUrl,
    // Author updated to Organization
    author: {
      '@type': 'Organization',
      name: defaultSiteName,
      url: defaultSiteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${defaultImageBaseUrl}/logo.png`,
      },
    },
    datePublished: '2025-01-01',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'ALL',
    // Publisher details included in structured data
    publisher: {
      '@type': 'Organization',
      name: defaultSiteName,
      url: defaultSiteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${defaultImageBaseUrl}/logo.png`,
      },
    },
    // Contact point (replace with actual details)
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Nogl',
      // telephone: '+1-800-555-1234', // Replace with your actual support number
      email: 'info@nogl.tech', // Replace with your actual support email
    },
    // AggregateRating can be adjusted or removed if not applicable
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '12',
    },
    // Offers can be adjusted based on your pricing model
    // offers: [
    //   {
    //     '@type': 'Offer',
    //     price: '9.00',
    //     priceCurrency: 'USD',
    //     availability: 'https://schema.org/InStock',
    //     url: defaultSiteUrl,
    //     validFrom: new Date().toISOString(),
    //   },
    // ],
  };

  const schemaData = customSchema || defaultSchema;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schemaData),
      }}
    ></script>
  );
};
