const { getAllHashedSessionIds } = require('./src/utils/hashId');

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  /**
   * The base URL of your website. Ensure this is correctly set to your production URL.
   * It's recommended to use an environment variable for flexibility across environments.
   */
  siteUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://www.nogl.ai',

  /**
   * Specifies the output directory for the generated sitemap files.
   * The default is 'public', which is suitable for most Next.js projects.
   */
  outDir: './public',

  /**
   * Determines whether to generate a `robots.txt` file.
   * Setting this to true is recommended to guide search engine crawlers.
   */
  generateRobotsTxt: true,

  /**
   * Allows you to specify an array of paths to exclude from the sitemap.
   * Useful for private pages, admin routes, or any pages you don't want indexed.
   */
  exclude: [
    // Authentication & User Routes
    '/account-bookings',
    '/account-savelists',
    '/admin',
    '/admin/*',
    '/user',
    '/user/*',
    '/onboarding',
    '/vc',
    '/checkout',
    '/author',
    '/author/*',
    
    // Auth Routes
    '/login',
    '/signup',
    '/auth/*',
    '/verify-email',
    
    // API Routes
    '/api/*',
    '/server-sitemap.xml',
    
    // Error Pages
    '/error',
    '/404',
    '/500',
  ],

  /**
   * Allows adding dynamic paths to the sitemap.
   * Used here to add all session detail pages with their hashed IDs.
   */
  additionalPaths: async (config) => {
    const hashedSessions = await getAllHashedSessionIds();
    
    return hashedSessions.map((session) => ({
      loc: `/listing-session-detail/${session.hashedId}`,
      changefreq: 'daily',
      priority: 0.7,
      lastmod: session.lastmod,
    }));
  },

  /**
   * Specifies the maximum number of URLs per sitemap file.
   * The default is 50,000, but you can adjust based on your site's size.
   */
  sitemapSize: 7000,

  /**
   * Configuration options for the generated `robots.txt`.
   * This includes additional sitemaps and various directives.
   */
  robotsTxtOptions: {
    // Specifies additional sitemap files if you have multiple sitemaps
    additionalSitemaps: [
      `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.nogl.ai'}/sitemap-0.xml`,
    ],
    policies: [
      {
        userAgent: '*',
        allow: '/',
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/admin/*', '/login'],
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
      },
    ],
    // Optional: Sitemap location in robots.txt
    sitemap: `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.nogl.ai'}/sitemap.xml`,
    // Optional: Host location
    host: process.env.NEXT_PUBLIC_APP_URL || 'https://www.nogl.ai',
  },

  /**
   * Determines if trailing slashes should be added to URLs.
   * Consistency is key; ensure your Next.js routing matches this setting.
   */
  trailingSlash: false,

  /**
   * Specifies the change frequency for the URLs.
   * Helps search engines prioritize crawling based on how often content changes.
   */
  changefreq: 'daily',

  /**
   * Specifies the priority of URLs relative to other URLs on your site.
   * Values range from 0.0 to 1.0; higher values indicate higher priority.
   */
  priority: 0.7,

  /**
   * Configure multilingual support if your site is available in multiple languages.
   * Useful for international SEO.
   */
  alternateRefs: [
    {
      href: 'https://www.nogl.ai/',
      hreflang: 'en',
    },
  ],

  /**
   * Automatically detects and includes dynamic routes.
   * Ensures that all pages, including those generated at runtime, are included in the sitemap.
   */
  generateIndexSitemap: true,

  priorityMap: async () => {
    return {
      '/': 1.0,
      '/about': 0.8,
      '/contact': 0.8,
      '/blog': 0.7,
    };
  },

  /**
   * Transform function to customize sitemap entries.
   * Allows adding additional fields like lastmod, changefreq, etc.
   */
  transform: async (config, path) => {
    return {
      loc: path,
      changefreq: 'daily',
      priority: 0.7,
      lastmod: new Date().toISOString(),
    };
  },
};
