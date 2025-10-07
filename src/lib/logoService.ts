/**
 * Logo.dev Service
 * 
 * This service provides utilities for generating logo URLs using the logo.dev API.
 * Logo.dev provides high-quality brand logos through a simple REST API.
 * 
 * @see https://logo.dev/docs
 */

const LOGO_DEV_TOKEN = process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN || 'pk_bjGBOZlPTmCYjnqmgu3OpQ';
const LOGO_DEV_BASE_URL = 'https://img.logo.dev';

/**
 * Logo configuration options
 */
export interface LogoOptions {
  /** Image format (png, jpg, svg) */
  format?: 'png' | 'jpg' | 'svg';
  /** Image size in pixels (40, 64, 128) */
  size?: 40 | 64 | 128;
  /** API token (uses default if not provided) */
  token?: string;
}

/**
 * Validates if a string is a valid domain name
 */
function isValidDomain(domain: string): boolean {
  if (!domain || typeof domain !== 'string') return false;
  
  // Remove protocol if present
  const cleanDomain = domain.replace(/^https?:\/\//, '').split('/')[0];
  
  // Basic domain validation regex
  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/;
  return domainRegex.test(cleanDomain);
}

/**
 * Extracts a potential domain from a brand name
 * Uses common patterns to generate likely domain names
 * This is a fallback when no product URL is available
 */
function brandNameToDomain(brandName: string): string | null {
  if (!brandName) return null;
  
  // Clean the brand name
  const cleanName = brandName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, ''); // Remove spaces
  
  if (!cleanName) return null;
  
  // Default to .com (most common)
  return `${cleanName}.com`;
}

/**
 * Generates a logo.dev URL for a given domain or brand name
 * 
 * @param domainOrBrand - Domain name (e.g., 'shopify.com') or brand name (e.g., 'Shopify')
 * @param options - Logo configuration options
 * @returns Logo URL or null if invalid input
 * 
 * @example
 * ```typescript
 * // Using domain
 * const logoUrl = generateLogoUrl('shopify.com');
 * // => 'https://img.logo.dev/shopify.com?format=png&size=64&token=...'
 * 
 * // Using brand name
 * const logoUrl = generateLogoUrl('Ellijewelry', { size: 128 });
 * // => 'https://img.logo.dev/ellijewelry.com?format=png&size=128&token=...'
 * 
 * // Custom options
 * const logoUrl = generateLogoUrl('shopify.com', { format: 'svg', size: 40 });
 * // => 'https://img.logo.dev/shopify.com?format=svg&size=40&token=...'
 * ```
 */
export function generateLogoUrl(
  domainOrBrand: string | null | undefined,
  options: LogoOptions = {}
): string | null {
  if (!domainOrBrand) return null;
  
  const {
    format = 'png',
    size = 64,
    token = LOGO_DEV_TOKEN
  } = options;
  
  let domain: string | null = null;
  
  // Check if it's already a valid domain
  if (isValidDomain(domainOrBrand)) {
    domain = domainOrBrand.replace(/^https?:\/\//, '').split('/')[0];
  } else {
    // Try to convert brand name to domain
    domain = brandNameToDomain(domainOrBrand);
  }
  
  if (!domain) return null;
  
  // Build the URL with query parameters
  const params = new URLSearchParams({
    format,
    size: size.toString(),
    token
  });
  
  return `${LOGO_DEV_BASE_URL}/${domain}?${params.toString()}`;
}

/**
 * Generates logo URLs for multiple domains/brands
 * 
 * @param domainsOrBrands - Array of domain names or brand names
 * @param options - Logo configuration options
 * @returns Array of logo URLs (null for invalid inputs)
 */
export function generateLogoUrls(
  domainsOrBrands: (string | null | undefined)[],
  options: LogoOptions = {}
): (string | null)[] {
  return domainsOrBrands.map(item => generateLogoUrl(item, options));
}

/**
 * Generates a logo URL with a fallback
 * 
 * @param primaryDomainOrBrand - Primary domain or brand name
 * @param fallbackDomainOrBrand - Fallback domain or brand name
 * @param options - Logo configuration options
 * @returns Logo URL from primary or fallback, or null if both fail
 */
export function generateLogoUrlWithFallback(
  primaryDomainOrBrand: string | null | undefined,
  fallbackDomainOrBrand: string | null | undefined,
  options: LogoOptions = {}
): string | null {
  const primaryUrl = generateLogoUrl(primaryDomainOrBrand, options);
  if (primaryUrl) return primaryUrl;
  
  return generateLogoUrl(fallbackDomainOrBrand, options);
}

/**
 * Channel/Platform logo URLs (commonly used platforms)
 */
export const CHANNEL_LOGOS = {
  shopify: generateLogoUrl('shopify.com'),
  woocommerce: generateLogoUrl('woocommerce.com'),
  magento: generateLogoUrl('magento.com'),
  bigcommerce: generateLogoUrl('bigcommerce.com'),
  prestashop: generateLogoUrl('prestashop.com'),
  opencart: generateLogoUrl('opencart.com'),
  squarespace: generateLogoUrl('squarespace.com'),
  wix: generateLogoUrl('wix.com'),
} as const;

/**
 * Gets a channel logo URL by channel name
 * 
 * @param channel - Channel name (e.g., 'shopify', 'woocommerce')
 * @returns Logo URL or null if not found
 */
export function getChannelLogo(channel: string | null | undefined): string | null {
  if (!channel) return null;
  
  const normalizedChannel = channel.toLowerCase() as keyof typeof CHANNEL_LOGOS;
  return CHANNEL_LOGOS[normalizedChannel] || generateLogoUrl(channel);
}

/**
 * Extracts domain from URL with improved pattern matching
 * 
 * @param url - Full URL or partial domain
 * @returns Clean domain name or null
 * 
 * @example
 * extractDomainFromUrl('https://www.shopify.com/products/123') // => 'shopify.com'
 * extractDomainFromUrl('cdn.shopify.com/images/logo.png') // => 'shopify.com'
 * extractDomainFromUrl('https://ellijewelry.com') // => 'ellijewelry.com'
 */
export function extractDomainFromUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  
  try {
    // Try parsing as a full URL
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    let hostname = urlObj.hostname;
    
    // Remove 'www.' prefix
    hostname = hostname.replace(/^www\./, '');
    
    // Remove common CDN/subdomain prefixes
    hostname = hostname.replace(/^cdn\./, '');
    hostname = hostname.replace(/^static\./, '');
    hostname = hostname.replace(/^img\./, '');
    hostname = hostname.replace(/^images\./, '');
    hostname = hostname.replace(/^assets\./, '');
    
    return hostname;
  } catch {
    // If URL parsing fails, try regex extraction
    let cleanUrl = url.trim();
    
    // Remove protocol if present
    cleanUrl = cleanUrl.replace(/^https?:\/\//, '');
    
    // Remove www. prefix
    cleanUrl = cleanUrl.replace(/^www\./, '');
    
    // Extract domain pattern (e.g., 'example.com' or 'example.co.uk')
    const domainMatch = cleanUrl.match(/^([a-zA-Z0-9-]+\.(?:[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})?))/);
    
    if (domainMatch) {
      return domainMatch[1];
    }
    
    // Last resort: simple domain extraction
    const simpleMatch = cleanUrl.match(/([a-zA-Z0-9-]+\.[a-zA-Z]{2,})/);
    return simpleMatch ? simpleMatch[1] : null;
  }
}

/**
 * Extracts the main domain from subdomains
 * Example: 'cdn.shopify.com' => 'shopify.com'
 */
export function extractMainDomain(domain: string | null): string | null {
  if (!domain) return null;
  
  const parts = domain.split('.');
  
  // Handle special TLDs like .co.uk, .com.au
  const specialTLDs = ['co.uk', 'com.au', 'co.za', 'co.in', 'com.br'];
  const lastTwo = parts.slice(-2).join('.');
  
  if (specialTLDs.includes(lastTwo)) {
    // Return last 3 parts (domain.co.uk)
    return parts.slice(-3).join('.');
  }
  
  // Return last 2 parts (domain.com)
  return parts.slice(-2).join('.');
}

