# Logo.dev Integration Guide

## Overview

This guide documents our implementation and best practices for integrating logo.dev service into our application for displaying brand logos. Logo.dev is a service that provides high-quality brand logos through a simple API.

## Table of Contents

1. [What is Logo.dev?](#what-is-logodev)
2. [API Overview](#api-overview)
3. [Integration Implementation](#integration-implementation)
4. [Best Practices](#best-practices)
5. [Troubleshooting](#troubleshooting)
6. [Code Examples](#code-examples)
7. [Performance Considerations](#performance-considerations)
8. [Attribution Requirements](#attribution-requirements)

## What is Logo.dev?

Logo.dev is a service that provides access to thousands of brand logos through a simple REST API. It's particularly useful for applications that need to display company logos without hosting them locally.

### Key Features
- **High-Quality Logos**: Vector and raster formats available
- **Multiple Sizes**: Various dimensions supported
- **Multiple Formats**: PNG, JPG, SVG support
- **Easy Integration**: Simple URL-based API
- **Brand Coverage**: Extensive database of company logos

## API Overview

### Base URL Structure
```
https://img.logo.dev/{domain}?token={api_token}&format={format}&size={size}
```

### Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `domain` | string | Yes | Company domain name | `shopify.com` |
| `token` | string | Yes | Your API token | `pk_bjGBOZlPTmCYjnqmgu3OpQ` |
| `format` | string | No | Image format | `png`, `jpg`, `svg` |
| `size` | number | No | Image size in pixels | `40`, `64`, `128` |

### Example URLs
```javascript
// Basic usage
https://img.logo.dev/shopify.com?token=pk_bjGBOZlPTmCYjnqmgu3OpQ

// With parameters
https://img.logo.dev/ellijewelry.com?format=png&size=64&token=pk_bjGBOZlPTmCYjnqmgu3OpQ

// SVG format (vector)
https://img.logo.dev/woocommerce.com?format=svg&token=pk_bjGBOZlPTmCYjnqmgu3OpQ
```

## Integration Implementation

### 1. Basic Integration

We implemented logo.dev integration in our `TanStackTable` component for displaying brand logos:

```typescript
// Brand column implementation
const brandLogos = {
  shopify: 'https://img.logo.dev/shopify.com?format=png&size=64&token=pk_bjGBOZlPTmCYjnqmgu3OpQ',
  woocommerce: 'https://img.logo.dev/woocommerce.com?format=png&size=64&token=pk_bjGBOZlPTmCYjnqmgu3OpQ',
  magento: 'https://img.logo.dev/magento.com?format=png&size=64&token=pk_bjGBOZlPTmCYjnqmgu3OpQ',
  // ... more platforms
};
```

### 2. Dynamic Logo Generation

For dynamic brand logos based on domain names:

```typescript
const getBrandLogo = (domain: string) => {
  return `https://img.logo.dev/${domain}?format=png&size=64&token=pk_bjGBOZlPTmCYjnqmgu3OpQ`;
};
```

### 3. Error Handling

We implemented robust error handling for logo loading failures:

```typescript
<img
  src={brand.logo}
  alt={brand.name}
  className="w-6 h-6 rounded object-contain"
  onError={(e) => {
    const target = e.target as HTMLImageElement;
    target.style.display = 'none';
    target.nextElementSibling?.classList.remove('hidden');
  }}
  onLoad={(e) => {
    const target = e.target as HTMLImageElement;
    target.nextElementSibling?.classList.add('hidden');
  }}
/>
```

## Best Practices

### 1. Container Styling

Based on logo.dev recommendations, we use white backgrounds for optimal logo display:

```css
/* Recommended container styling */
.logo-container {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}
```

**Why white background?**
- Ensures proper contrast for all logo colors
- Follows logo.dev's recommended practices
- Provides consistent appearance across different logos
- Maintains brand integrity

### 2. Image Sizing and Scaling

```typescript
// Optimal sizing strategy
const logoSize = 64; // High resolution for crisp display
const containerSize = 32; // Container size in pixels
const imageClass = "object-contain"; // Maintains aspect ratio
```

**Sizing Guidelines:**
- Use `object-contain` instead of `object-cover` to maintain aspect ratio
- Use higher resolution images (64px) in smaller containers (32px) for crisp display
- Add `overflow: hidden` to prevent logo overflow

### 3. Format Selection

| Use Case | Recommended Format | Reason |
|----------|-------------------|---------|
| Web Display | PNG | Better quality, supports transparency |
| Print/High-res | SVG | Vector format, infinitely scalable |
| Performance | JPG | Smaller file size for large logos |

### 4. Fallback Strategy

Always provide fallbacks for failed logo loads:

```typescript
// Fallback implementation
const LogoWithFallback = ({ brand }) => {
  const [logoError, setLogoError] = useState(false);
  
  return (
    <div className="logo-container">
      {!logoError && brand.logo ? (
        <img
          src={brand.logo}
          alt={brand.name}
          onError={() => setLogoError(true)}
        />
      ) : (
        <div className="fallback-logo">
          {brand.name.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
};
```

## Troubleshooting

### Common Issues and Solutions

#### 1. Logo Not Loading
**Symptoms:** Broken image icon or fallback showing
**Solutions:**
- Verify API token is correct
- Check domain name spelling
- Test URL directly in browser
- Check network connectivity

#### 2. Blurry Logos
**Symptoms:** Logo appears pixelated or blurry
**Solutions:**
- Increase size parameter (use 64px instead of 40px)
- Use PNG format instead of JPG
- Ensure container size matches image size
- Use `object-contain` for proper scaling

#### 3. Wrong Country Detection
**Symptoms:** Country shows "US" instead of correct country
**Solutions:**
- Implement brand name-based detection
- Check domain TLD logic
- Add specific brand exceptions

```typescript
// Example: German brand detection
const getCountryInfo = (domain: string, brandName?: string) => {
  if (brandName?.toLowerCase().includes('elli') || 
      brandName?.toLowerCase().includes('german') || 
      domain?.includes('.de')) {
    return { code: 'DE', name: 'Germany', flag: '🇩🇪' };
  }
  // ... other country logic
};
```

#### 4. CORS Issues
**Symptoms:** Logos not loading due to CORS restrictions
**Solutions:**
- Ensure proper referrer headers
- Check if attribution link is included
- Verify API token permissions

## Code Examples

### Complete Brand Column Implementation

```typescript
// Brand column with logo.dev integration
{
  accessorKey: 'brand',
  id: 'brand',
  header: 'Brand',
  cell: ({ row }) => {
    const product = row.original as any;
    const brand = product.brand;
    const domain = product.domain;
    
    // Generate logo URL
    const logoUrl = brand?.logo || 
      `https://img.logo.dev/${domain}?format=png&size=64&token=pk_bjGBOZlPTmCYjnqmgu3OpQ`;
    
    // Country detection logic
    const getCountryInfo = (domain: string, brandName?: string) => {
      if (brandName?.toLowerCase().includes('elli') || 
          brandName?.toLowerCase().includes('german') || 
          domain?.includes('.de')) {
        return { code: 'DE', name: 'Germany', flag: '🇩🇪' };
      }
      // ... other countries
      return { code: 'US', name: 'United States', flag: '🇺🇸' };
    };
    
    const countryInfo = getCountryInfo(domain, brand?.name);
    
    return (
      <div className="group relative flex items-center gap-2.5">
        {/* Logo Container */}
        <div className="relative">
          <div className="w-8 h-8 rounded-lg bg-white dark:bg-white flex items-center justify-center border border-gray-200 dark:border-gray-300 overflow-hidden shadow-sm">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={brand?.name || 'Brand Logo'}
                className="w-6 h-6 rounded object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
                onLoad={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.nextElementSibling?.classList.add('hidden');
                }}
              />
            ) : null}
            <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-semibold text-gray-600 dark:text-gray-300 ${logoUrl ? 'hidden' : ''}`}>
              {brand?.name?.charAt(0).toUpperCase() || '?'}
            </div>
          </div>
        </div>
        
        {/* Brand Name and Country */}
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
            {brand?.name || 'Unknown'}
          </span>
          <div className="flex items-center gap-1">
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
              {countryInfo.flag} {countryInfo.code}
            </span>
          </div>
        </div>
      </div>
    );
  },
  enableSorting: true,
}
```

### Channel Column Implementation

```typescript
// Channel logos for different platforms
const channelLogos = {
  shopify: 'https://img.logo.dev/shopify.com?format=png&size=64&token=pk_bjGBOZlPTmCYjnqmgu3OpQ',
  woocommerce: 'https://img.logo.dev/woocommerce.com?format=png&size=64&token=pk_bjGBOZlPTmCYjnqmgu3OpQ',
  magento: 'https://img.logo.dev/magento.com?format=png&size=64&token=pk_bjGBOZlPTmCYjnqmgu3OpQ',
  bigcommerce: 'https://img.logo.dev/bigcommerce.com?format=png&size=64&token=pk_bjGBOZlPTmCYjnqmgu3OpQ',
  prestashop: 'https://img.logo.dev/prestashop.com?format=png&size=64&token=pk_bjGBOZlPTmCYjnqmgu3OpQ',
  opencart: 'https://img.logo.dev/opencart.com?format=png&size=64&token=pk_bjGBOZlPTmCYjnqmgu3OpQ',
};
```

## Performance Considerations

### 1. Image Optimization
- Use appropriate sizes (64px for small containers)
- Prefer PNG for quality, JPG for performance
- Implement lazy loading for large lists

### 2. Caching Strategy
```typescript
// Implement logo caching
const logoCache = new Map();

const getCachedLogo = (domain: string) => {
  if (logoCache.has(domain)) {
    return logoCache.get(domain);
  }
  
  const logoUrl = `https://img.logo.dev/${domain}?format=png&size=64&token=${API_TOKEN}`;
  logoCache.set(domain, logoUrl);
  return logoUrl;
};
```

### 3. Error Rate Monitoring
- Track logo loading failures
- Implement retry logic for failed requests
- Monitor API usage and limits

## Attribution Requirements

### Free Plan Requirements
If using logo.dev's free plan, include attribution:

```html
<!-- Required attribution for free plan -->
<a href="https://logo.dev" target="_blank" rel="noopener noreferrer">
  Logos provided by Logo.dev
</a>
```

### Implementation
```typescript
// Add attribution to footer or about page
const LogoAttribution = () => (
  <div className="text-xs text-gray-500 text-center py-2">
    <a 
      href="https://logo.dev" 
      target="_blank" 
      rel="noopener noreferrer"
      className="hover:text-gray-700"
    >
      Logos provided by Logo.dev
    </a>
  </div>
);
```

## Security Considerations

### 1. API Token Security
- Store API token in environment variables
- Never expose tokens in client-side code
- Use server-side proxy for sensitive applications

### 2. Domain Validation
```typescript
// Validate domains before making requests
const isValidDomain = (domain: string) => {
  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
  return domainRegex.test(domain);
};
```

### 3. Rate Limiting
- Implement client-side rate limiting
- Monitor API usage
- Handle rate limit responses gracefully

## Monitoring and Analytics

### 1. Logo Load Success Rate
```typescript
// Track logo loading success
const trackLogoLoad = (domain: string, success: boolean) => {
  analytics.track('logo_load', {
    domain,
    success,
    timestamp: Date.now()
  });
};
```

### 2. Performance Metrics
- Track logo loading times
- Monitor error rates by domain
- Analyze user engagement with logo features

## Future Enhancements

### 1. Logo Preloading
```typescript
// Preload commonly used logos
const preloadLogos = (domains: string[]) => {
  domains.forEach(domain => {
    const img = new Image();
    img.src = `https://img.logo.dev/${domain}?format=png&size=64&token=${API_TOKEN}`;
  });
};
```

### 2. Dynamic Sizing
```typescript
// Responsive logo sizing
const getResponsiveLogoSize = (containerWidth: number) => {
  if (containerWidth < 32) return 32;
  if (containerWidth < 48) return 48;
  return 64;
};
```

### 3. Logo Quality Detection
```typescript
// Detect and handle low-quality logos
const detectLogoQuality = (img: HTMLImageElement) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, img.width, img.height);
  // Analyze image quality and apply filters if needed
};
```

## Conclusion

Logo.dev integration provides a robust solution for displaying brand logos in our application. By following these best practices and implementing proper error handling, we can ensure a consistent and professional user experience while maintaining good performance and reliability.

### Key Takeaways
1. **White backgrounds** provide the best contrast for logos
2. **PNG format at 64px** offers optimal quality for small containers
3. **Proper error handling** ensures graceful fallbacks
4. **Country detection** should consider brand names, not just domains
5. **Attribution** is required for free plan usage
6. **Performance monitoring** helps maintain good user experience

This implementation serves as a foundation for future logo integrations and can be extended to support additional features as needed.
