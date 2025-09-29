'use client';

import { useState, useRef } from 'react';

// Icon components from Figma design
interface Component1Props {
  variant?: "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12" | "13" | "14" | "15" | "16" | "17" | "18" | "19" | "20" | "21" | "22" | "23" | "24" | "25" | "26" | "27" | "28";
}

function Component1({ variant = "1" }: Component1Props) {
  const getIconContent = () => {
    switch (variant) {
      case "8":
        return (
          <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 2C5.58 2 2 5.58 2 10s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm0-10c-2.21 0-4 1.79-4 4s1.79 M8 12c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2z"/>
          </svg>
        );
      case "7":
        return (
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 4l4 4-4 4-4-4 4-4z"/>
          </svg>
        );
      case "26":
        return (
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="8" cy="8" r="1.5"/>
            <path d="M8 2v2"/>
            <path d="M14 8h2"/>
            <path d="M8 14v2"/>
            <path d="M2 8H0"/>
          </svg>
        );
      case "27":
        return (
          <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
            <path d="M10 6L8.59 4.59L6 7.17L3.41 4.59L2 6L6 10L10 6Z" fill="currentColor"/>
          </svg>
        );
      case "28":
        return (
          <svg className="w-4 h-4" viewBox="0 0 16 8" fill="currentColor">
            <circle cx="8" cy="4" r="1"/>
            <path d="M14 4H2"/>
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 2L3 7v11c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V7l-7-5z"/>
          </svg>
        );
    }
  };

  return (
    <div className="flex items-center justify-center">
      {getIconContent()}
    </div>
  );
}

// Product data interface
interface ProductData {
  title: string;
  price: number;
  currency: string;
  stockStatus: string;
  code: string;
  brand: string;
  imageUrl?: string;
  isValidUrl: boolean;
  errorMessage?: string;
}

export default function AddEcommerceCompetitorPage() {
  const [competitorUrl, setCompetitorUrl] = useState('www.luamaya.com/products/charm-bundle');
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState(true);
  const [showProduct, setShowProduct] = useState(true);
  const [productData, setProductData] = useState<ProductData | null>(null);
  const [urlError, setUrlError] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  // URL validation function
  const validateUrl = (url: string): { isValid: boolean; error: string; cleanUrl: string } => {
    // Basic validation patterns
    const urlPatterns = [
      /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
      /^(https?:\/\/)?(www\.)?[\w-]+(\.[\w-]+)+([\w.,@?^=%&:\/~+#-]*[\w@?^=%&\/~+#-])?$/
    ];

    // Add protocol if missing
    let cleanUrl = url.trim();
    if (!cleanUrl.match(/^https?:\/\//)) {
      cleanUrl = `https://${cleanUrl}`;
    }

    // Check if URL matches patterns
    const isValidFormat = urlPatterns.some(pattern => pattern.test(cleanUrl));
    
    // Check for common e-commerce URL patterns
    const ecommercePatterns = [
      /\/product/,
      /\/item/,
      /\/goods/,
      /\/(?:buy|purchase)/,
      /\/(?:shop|store)/,
      /\/addtocart/,
      /\/cart/
    ];
    
    const hasEcommercePattern = ecommercePatterns.some(pattern => pattern.test(cleanUrl.toLowerCase()));

    if (!isValidFormat) {
      return { isValid: false, error: 'Please enter a valid URL', cleanUrl };
    }

    if (!hasEcommercePattern && !url.includes('product') && !url.includes('item') && !url.includes('shop')) {
      return { isValid: false, error: 'Please enter a product or shop page URL', cleanUrl };
    }

    return { isValid: true, error: '', cleanUrl };
  };

  // Mock product data extraction (replace with actual API call)
  const extractProductData = async (url: string): Promise<ProductData> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock successful extraction
    return {
      title: "Charm Bundle",
      price: 24.90,
      currency: "EUR",
      stockStatus: "Available",
      code: "2726",
      brand: "Luamaya",
      imageUrl: undefined, // Would come from API
      isValidUrl: true
    };
  };

  const handleCheckUrl = async () => {
    setUrlError('');
    setIsValidating(true);
    setShowProduct(false);
    setProductData(null);

    try {
      // Validate URL format
      const validation = validateUrl(competitorUrl);
      
      if (!validation.isValid) {
        setIsValidating(false);
        setUrlError(validation.error);
        setIsValid(false);
        return;
      }

      // Update display URL
      setCompetitorUrl(validation.cleanUrl.replace(/^https?:\/\//, ''));

      // Simulate product data extraction
      const extractedData = await extractProductData(validation.cleanUrl);

      // Check if extraction was successful
      if (!extractedData.isValidUrl) {
        setUrlError(extractedData.errorMessage || 'Unable to extract product data from this URL');
        setIsValid(false);
      } else {
        setProductData(extractedData);
        setIsValid(true);
        setShowProduct(true);
      }

    } catch (error) {
      setUrlError('Error processing URL. Please try again.');
      setIsValid(false);
    } finally {
      setIsValidating(false);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setCompetitorUrl(newUrl);
    
    // Clear previous validation state when user types
    if (urlError) setUrlError('');
    if (!isValid) setIsValid(true);
  };

  const handleBack = () => {
    // Navigate back to previous page or competitors list
    if (typeof window !== 'undefined') {
      window.history.back();
    }
  };

  const handleSave = () => {
    if (productData) {
      // Here you would typically send the data to your API
      console.log('Saving competitor product:', productData);
      
      // Simulate successful save
      alert('Competitor product saved successfully!');
      
      // Navigate back to competitors list
      if (typeof window !== 'undefined') {
        window.history.back();
      }
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto p-6">

        <div className="space-y-6">
          {/* Header Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <h1 className="text-[#4b5563] text-base font-normal">Competitor's Product URL</h1>
              <Component1 variant="26" />
              <a href="https://help.pricefy.io/how-to-add-a-new-competitor/" className="text-[#5c96f4] text-sm underline">
                How it works
              </a>
            </div>

            {/* URL Input Section */}
            <div className="relative">
              <div className="flex items-center bg-white border border-[#D1D5DB] rounded-lg overflow-hidden">
                <div className="bg-gray-50 border-r border-[#D1D5DB] px-3 py-3">
                  <span className="text-gray-600 font-normal text-sm">https://</span>
                </div>
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={competitorUrl}
                    onChange={handleUrlChange}
                    className="w-full px-3 py-3 border-0 focus:ring-0 focus:outline-none text-black text-sm font-normal placeholder-gray-500 bg-white"
                    placeholder="Enter competitor's product URL"
                    style={{ paddingRight: '200px' }}
                  />
                  
                  {/* Valid Indicator */}
                  {isValid && !urlError && (
                    <div className="absolute right-[120px] top-1/2 transform -translate-y-1/2 flex items-center px-2 py-1 bg-[#def7ec] rounded-full">
                      <svg className="w-3 h-3 text-[#0e9f6e]" viewBox="0 0 12 12" fill="none">
                        <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="ml-1 text-[#0e9f6e] text-xs font-medium">Valid</span>
                    </div>
                  )}

                  {/* Check Now Button */}
                  <button
                    onClick={handleCheckUrl}
                    disabled={isValidating}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#5c96f4] text-white px-6 py-2 rounded text-sm font-medium hover:bg-blue-600 disabled:opacity-50 transition-colors"
                  >
                    {isValidating ? 'Checking...' : 'Check Now'}
                  </button>
                </div>
              </div>
            </div>

            <p className="text-gray-600 text-xs">
              Please enter a page of your competitor's store which contains product information
            </p>
            
            {/* Error Message */}
            {urlError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-red-700 text-sm">{urlError}</span>
                </div>
              </div>
            )}
          </div>

          {/* Product Analysis Section */}
          {showProduct && (
            <div className="border-t pt-6">
              <div className="flex gap-6">
                {/* Product Image */}
                <div className="w-96">
                  <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center border-2 border-gray-200">
                    <div className="text-center space-y-2">
                      <div className="w-20 h-20 bg-yellow-200 rounded-lg mx-auto flex items-center justify-center">
                        <svg className="w-8 h-8 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                        </svg>
                      </div>
                      <div className="text-sm text-gray-600">Product Image</div>
                      <div className="text-xs text-gray-500">{productData ? `${productData.title} from ${productData.brand}` : 'Charm Bundle from Luamaya'}</div>
                    </div>
                  </div>
                </div>

                {/* Data Fields */}
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-4">
                    <h2 className="text-[#4b5563] text-base font-normal">Data Fields Matching</h2>
                    <Component1 variant="28" />
                    <a href="https://help.pricefy.io/how-to-add-a-new-competitor/" className="text-[#5c96f4] text-sm underline">
                      How it works
                    </a>
                  </div>

                  <div className="space-y-4">
                    {/* Title Field */}
                    <div className="space-y-1">
                      <label className="text-[#4b5563] text-base">Title</label>
                      <div className="bg-gray-100 px-3 py-2 rounded text-gray-600">
                        {productData ? productData.title : 'Charm Bundle'}
                      </div>
                    </div>

                    {/* Price and Stock Row */}
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <label className="text-[#4b5563] text-base">Price</label>
                        <div className="flex">
                          <div className="bg-blue-50 px-3 py-2 border border-gray-300 rounded-l text-gray-600">
                            {productData ? productData.currency : 'EUR'}
                          </div>
                          <div className="bg-gray-100 px-3 py-2 border border-l-0 border-gray-300 rounded-r text-gray-600">
                            {productData ? productData.price : '24.90'}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[#4b5563] text-base">Stock</label>
                        <div className="bg-gray-100 px-3 py-2 rounded text-green-600">
                          {productData ? productData.stockStatus : 'Available'}
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-600 text-xs">
                      Note: Currency is auto-detected and can be changed from supplier's profile
                    </p>

                    {/* Code Field */}
                    <div className="space-y-1">
                      <label className="text-[#4b5563] text-base">
                        Code <span className="text-[#98a2b3] text-sm">(EAN/UPC/GTIN/MPN)</span>
                      </label>
                      <div className="bg-gray-100 px-3 py-2 rounded text-gray-600">
                        {productData ? productData.code : '2726'}
                      </div>
                    </div>

                    {/* Brand Field */}
                    <div className="space-y-1">
                      <label className="text-[#4b5563] text-base">Brand</label>
                      <div className="bg-gray-100 px-3 py-2 rounded text-gray-600">
                        {productData ? productData.brand : 'Luamaya'}
                      </div>
                    </div>

                    {/* Contact Info */}
                    <p className="text-gray-500 text-xs pt-3">
                      If you think that one of those info is not correct, 
                      <a href="#" className="text-blue-500 underline"> please contact us using this form</a>
                    </p>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 pt-4">
                      <button 
                        onClick={handleBack}
                        className="px-6 py-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-50"
                      >
                        Back
                      </button>
                      <button 
                        onClick={handleSave}
                        className="px-6 py-2 bg-[#62c554] text-white rounded hover:bg-green-600"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}