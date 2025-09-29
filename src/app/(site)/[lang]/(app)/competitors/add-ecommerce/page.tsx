'use client';

import { useState, useRef } from 'react';

// Enhanced Icon components
interface Component1Props {
  variant?: "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12" | "13" | "14" | "15" | "16" | "17" | "18" | "19" | "20" | "21" | "22" | "23" | "24" | "25" | "26" | "27" | "28";
}

function Component1({ variant = "1" }: Component1Props) {
  const getIconContent = () => {
    switch (variant) {
      case "26":
        return (
          <svg className="w-4 h-4 text-blue-600" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="8" cy="8" r="1.5"/>
            <path d="M8 2v2"/>
            <path d="M14 8h2"/>
            <path d="M8 14v2"/>
            <path d="M2 8H0"/>
          </svg>
        );
      case "27":
        return (
          <svg className="w-4 h-4 text-green-600" viewBox="0 0 16 16" fill="currentColor">
            <path d="M13.5 2l-5 5-3-3-1.5 1.5L8.5 9l6.5-6.5L13.5 2z"/>
          </svg>
        );
      case "28":
        return (
          <svg className="w-4 h-4 text-blue-600" viewBox="0 0 32 4" fill="currentColor">
            <circle cx="16" cy="2" r="1"/>
            <line x1="16" y1="2" x2="32" y2="2" stroke="currentColor" strokeWidth="1"/>
            <line x1="16" y1="2" x2="0" y2="2" stroke="currentColor" strokeWidth="1"/>
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
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

// Loading spinner component
const LoadingSpinner = () => (
  <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-200 border-t-blue-600"></div>
);

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
    const urlPatterns = [
      /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
      /^(https?:\/\/)?(www\.)?[\w-]+(\.[\w-]+)+([\w.,@?^=%&:\/~+#-]*[\w@?^=%&\/~+#-])?$/
    ];

    let cleanUrl = url.trim();
    if (!cleanUrl.match(/^https?:\/\//)) {
      cleanUrl = `https://${cleanUrl}`;
    }

    const isValidFormat = urlPatterns.some(pattern => pattern.test(cleanUrl));
    
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

  // Mock product data extraction
  const extractProductData = async (url: string): Promise<ProductData> => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return {
      title: "Charm Bundle",
      price: 24.90,
      currency: "EUR",
      stockStatus: "Available",
      code: "2726",
      brand: "Luamaya",
      imageUrl: undefined,
      isValidUrl: true
    };
  };

  const handleCheckUrl = async () => {
    setUrlError('');
    setIsValidating(true);
    setShowProduct(false);
    setProductData(null);

    try {
      const validation = validateUrl(competitorUrl);
      
      if (!validation.isValid) {
        setIsValidating(false);
        setUrlError(validation.error);
        setIsValid(false);
        return;
      }

      setCompetitorUrl(validation.cleanUrl.replace(/^https?:\/\//, ''));

      const extractedData = await extractProductData(validation.cleanUrl);

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
    
    if (urlError) setUrlError('');
    if (!isValid) setIsValid(true);
  };

  const handleBack = () => {
    if (typeof window !== 'undefined') {
      window.history.back();
    }
  };

  const handleSave = () => {
    if (productData) {
      console.log('Saving competitor product:', productData);
      alert('Competitor product saved successfully!');
      
      if (typeof window !== 'undefined') {
        window.history.back();
      }
    }
  };

  return (
    <div className="min-h-screen bg-transparent">
      <div className="relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section */}
          <div className="w-full max-w-5xl mx-auto mb-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-white rounded-xl shadow-lg border border-gray-200">
              <div className="flex items-center gap-3">
                <h1 className="text-lg sm:text-xl font-semibold text-gray-800">
                  Competitor's Product URL
                </h1>
                <Component1 variant="26" />
              </div>
              <a 
                href="https://help.pricefy.io/how-to-add-a-new-competitor/" 
                className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors duration-200 px-3 py-2 rounded-md hover:bg-blue-50 whitespace-nowrap"
              >
                How it works
              </a>
            </div>
            
            <p className="text-center text-gray-600 text-sm sm:text-base mt-4 max-w-2xl mx-auto leading-relaxed">
              Please enter a page of your competitor's store which contains product information
            </p>
          </div>

          {/* URL Input Section */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 sm:p-8">
              <div className="space-y-4">
                {/* URL Input */}
                <div className="relative">
                  <div className="flex flex-col sm:flex-row items-stretch bg-gray-50 border-2 border-gray-200 rounded-xl overflow-hidden focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100 transition-all duration-200">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-4 flex items-center justify-center sm:justify-start">
                      <span className="text-white font-medium text-sm">https://</span>
                    </div>
                    
                    <div className="flex-1 relative">
                      <input
                        ref={inputRef}
                        type="text"
                        value={competitorUrl}
                        onChange={handleUrlChange}
                        className="w-full px-4 py-4 bg-white border-0 focus:ring-0 focus:outline-none text-gray-900 text-base font-normal placeholder-gray-500 pr-40 rounded-r-xl"
                        placeholder="Enter competitor's product URL"
                      />
                      
                      {/* Valid Indicator */}
                      {isValid && !urlError && !isValidating && (
                        <div className="absolute right-36 top-0 bottom-0 flex items-center px-2 py-1 bg-green-100 rounded-full">
                          <Component1 variant="27" />
                          <span className="ml-1 text-green-700 text-xs font-medium">Valid</span>
                        </div>
                      )}

                      {/* Loading State */}
                      {isValidating && (
                        <div className="absolute right-36 top-0 bottom-0 flex items-center px-2 py-1 rounded-full bg-blue-100">
                          <LoadingSpinner />
                          <span className="ml-1 text-blue-700 text-xs font-medium">Checking...</span>
                        </div>
                      )}
                      
                      {/* Check Now Button */}
                      <button
                        onClick={handleCheckUrl}
                        disabled={isValidating || !competitorUrl.trim()}
                        className="absolute right-2 top-2 bottom-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                      >
                        {isValidating ? <LoadingSpinner /> : 'Check Now'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Error Message */}
                {urlError && (
                  <div className="bg-red-50 border-l-4 border-red-400 rounded-lg p-4">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-red-400 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293z" clipRule="evenodd"/>
                      </svg>
                      <span className="text-red-700 text-sm">{urlError}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Product Analysis Section */}
          {showProduct && (
            <div className="max-w-6xl mx-auto">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                <div className="p-8">
                  {/* Section Header */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-8">
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">Data Fields Matching</h2>
                      <Component1 variant="28" />
                    </div>
                    <a 
                      href="https://help.pricefy.io/how-to-add-a-new-competitor/" 
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors duration-200 px-3 py-1 rounded-lg hover:bg-blue-50"
                    >
                      How it works
                    </a>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Product Image */}
                    <div className="lg:col-span-1">
                      <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center border-2 border-gray-300 shadow-inner">
                        <div className="text-center space-y-4 p-6">
                          <div className="w-24 h-24 bg-gradient-to-br from-yellow-300 to-yellow-400 rounded-xl mx-auto flex items-center justify-center shadow-lg">
                            <svg className="w-12 h-12 text-yellow-700" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                            </svg>
                          </div>
                          <div className="text-gray-700 font-medium text-lg">Product Image</div>
                          <div className="text-sm text-gray-600 leading-relaxed">
                            {productData ? `${productData.title} from ${productData.brand}` : 'Charm Bundle from Luamaya'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Data Fields */}
                    <div className="lg:col-span-2">
                      <div className="grid gap-6">
                        {/* Title Field */}
                        <div className="space-y-2">
                          <label className="text-gray-800 font-medium text-base">Product Title</label>
                          <div className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 text-gray-700 font-medium">
                            {productData ? productData.title : 'Charm Bundle'}
                          </div>
                        </div>

                        {/* Price and Stock Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-gray-800 font-medium text-base">Price</label>
                            <div className="flex overflow-hidden rounded-lg border border-gray-200 shadow-sm">
                              <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-3 border-r border-gray-200 text-blue-800 font-semibold text-sm">
                                {productData ? productData.currency : 'EUR'}
                              </div>
                              <div className="bg-white px-4 py-3 text-gray-800 font-semibold text-lg">
                                {productData ? productData.price : '24.90'}
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-gray-800 font-medium text-base">Stock Status</label>
                            <div className="bg-green-50 px-4 py-3 rounded-lg border border-green-200 text-green-800 font-medium">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                {productData ? productData.stockStatus : 'Available'}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Code Field */}
                        <div className="space-y-2">
                          <label className="text-gray-800 font-medium text-base">
                            Product Code
                            <span className="text-gray-500 font-normal text-sm ml-1">(EAN/UPC/GTIN/MPN)</span>
                          </label>
                          <div className="bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 text-gray-700 font-mono text-lg">
                            {productData ? productData.code : '2726'}
                          </div>
                        </div>

                        {/* Brand Field */}
                        <div className="space-y-2">
                          <label className="text-gray-800 font-medium text-base">Brand</label>
                          <div className="bg-gradient-to-r from-purple-50 to-purple-100 px-4 py-3 rounded-lg border border-purple-200 text-purple-800 font-semibold">
                            {productData ? productData.brand : 'Luamaya'}
                          </div>
                        </div>
                      </div>

                      {/* Currency Note */}
                      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-start gap-3">
                          <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                          </svg>
                          <div className="text-sm text-blue-800">
                            <strong>Currency Note:</strong> Currency is auto-detected and can be changed from supplier's profile.
                            If you think that any of this information is incorrect, 
                            <a href="#" className="text-blue-600 hover:text-blue-700 underline font-medium ml-1">
                              please contact us using this form
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 mt-8 pt-6 border-t border-gray-200">
                        <button 
                          onClick={handleBack}
                          className="px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                          Back
                        </button>
                        <button 
                          onClick={handleSave}
                          className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-medium rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl"
                        >
                          Save Competitor
                        </button>
                      </div>
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