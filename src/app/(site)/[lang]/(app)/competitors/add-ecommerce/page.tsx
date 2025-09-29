'use client';

import { useState } from 'react';

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

export default function AddEcommerceCompetitorPage() {
  const [competitorUrl, setCompetitorUrl] = useState('www.luamaya.com/products/charm-bundle');
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState(true);
  const [showProduct, setShowProduct] = useState(true);

  const handleCheckUrl = async () => {
    setIsValidating(true);
    // Simulate API call
    setTimeout(() => {
      setIsValidating(false);
      setIsValid(true);
      setShowProduct(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="flex">
        {/* Sidebar - Similar to Figma design */}
        <div className="w-60 bg-[#1d2145] min-h-screen flex flex-col">
          {/* Logo */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center">
              <Component1 />
              <span className="ml-3 text-white font-medium text-lg">PRICEFY</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 pt-8">
            <div className="space-y-2">
              <a href="/dashboard" className="flex items-center px-2 py-2 text-white hover:bg-white/10 rounded transition-colors">
                <Component1 variant="8" />
                <span className="ml-3">Dashboard</span>
              </a>
              <a href="/catalog" className="flex items-center px-2 py-2 text-white hover:bg-white/10 rounded transition-colors">
                <Component1 />
                <span className="ml-3">My Catalog</span>
              </a>
              <div className="flex items-center px-2 py-2 bg-blue-600 rounded transition-colors">
                <Component1 variant="8" />
                <span className="ml-3 flex-1">Competitors</span>
                <Component1 variant="7" />
              </div>
              <a href="/repricing" className="flex items-center px-2 py-2 text-white hover:bg-white/10 rounded transition-colors">
                <Component1 />
                <span className="ml-3">Repricing</span>
              </a>
              <a href="/reports" className="flex items-center px-2 py-2 text-white hover:bg-white/10 rounded transition-colors">
                <Component1 />
                <span className="ml-3">Reports</span>
              </a>
              <a href="/settings" className="flex items-center px-2 py-2 text-white hover:bg-white/10 rounded transition-colors">
                <Component1 />
                <span className="ml-3">Settings</span>
              </a>
              <a href="/account" className="flex items-center px-2 py-2 text-white hover:bg-white/10 rounded transition-colors">
                <Component1 />
                <span className="ml-3">My Account</span>
              </a>
            </div>
          </nav>

          {/* Progress Section */}
          <div className="p-4 border-t border-white/10">
            <div className="bg-gray-100 rounded p-2 mb-2">
              <div className="text-xs text-gray-600 mb-1">Completed 1 of 3</div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '33%' }}></div>
              </div>
            </div>
            <div className="flex justify-between items-center text-xs text-white">
              <span>Pricefy v1.7.2</span>
              <div className="flex items-center space-x-2">
                <span className="bg-red-500 text-white px-1 rounded text-xs">New</span>
                <a href="#" className="underline">Changelog</a>
              </div>
            </div>
          </div>

          {/* User Profile */}
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                TM
              </div>
              <div className="flex-1">
                <div className="text-white text-sm font-medium">Tuhin Mallick</div>
                <div className="text-white text-xs">tuhin.mllk@gmail.com</div>
              </div>
              <button className="text-white hover:bg-white/10 p-1 rounded">
                <Component1 />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 overflow-auto">
          <div className="max-w-6xl mx-auto">
            <div className="space-y-4">
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
                  <div className="flex rounded-lg shadow-sm border border-gray-300">
                    <div className="bg-gray-50 border-r border-gray-300 px-3 py-3 rounded-l-lg">
                      <span className="text-gray-600 font-normal text-sm">https://</span>
                    </div>
                    <input
                      type="text"
                      value={competitorUrl}
                      onChange={(e) => setCompetitorUrl(e.target.value)}
                      className="flex-1 px-3 py-3 border-0 focus:ring-0 text-black placeholder-gray-500"
                      placeholder="Enter competitor's product URL"
                    />
                  </div>
                  
                  {/* Valid Indicator */}
                  {isValid && (
                    <div className="absolute right-32 top-3 flex items-center px-2 py-1 bg-[#def7ec] rounded-full">
                      <Component1 variant="27" />
                      <span className="ml-1 text-[#0e9f6e] text-xs font-medium">Valid</span>
                    </div>
                  )}

                  {/* Check Now Button */}
                  <button
                    onClick={handleCheckUrl}
                    disabled={isValidating}
                    className="absolute right-2 top-2 bg-[#5c96f4] text-white px-8 py-2 rounded text-sm font-medium hover:bg-blue-600 disabled:opacity-50"
                  >
                    {isValidating ? 'Checking...' : 'Check Now'}
                  </button>
                </div>

                <p className="text-gray-600 text-xs">
                  Please enter a page of your competitor's store which contains product information
                </p>
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
                          <div className="text-xs text-gray-500">Charm Bundle from Luamaya</div>
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
                          <div className="bg-gray-100 px-3 py-2 rounded text-gray-600">Charm Bundle</div>
                        </div>

                        {/* Price and Stock Row */}
                        <div className="grid grid-cols-2 interval-6">
                          <div className="space-y-1">
                            <label className="text-[#4b5563] text-base">Price</label>
                            <div className="flex">
                              <div className="bg-blue-50 px-3 py-2 border border-gray-300 rounded-l text-gray-600">EUR</div>
                              <div className="bg-gray-100 px-3 py-2 border border-l-0 border-gray-300 rounded-r text-gray-600">24.90</div>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[#4b5563] text-base">Stock</label>
                            <div className="bg-gray-100 px-3 py-2 rounded text-green-600">Available</div>
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
                          <div className="bg-gray-100 px-3 py-2 rounded text-gray-600">2726</div>
                        </div>

                        {/* Brand Field */}
                        <div className="space-y-1">
                          <label className="text-[#4b5563] text-base">Brand</label>
                          <div className="bg-gray-100 px-3 py-2 rounded text-gray-600">Luamaya</div>
                        </div>

                        {/* Contact Info */}
                        <p className="text-gray-500 text-xs pt-3">
                          If you think that one of those info is not correct, 
                          <a href="#" className="text-blue-500 underline"> please contact us using this form</a>
                        </p>

                        {/* Action Buttons */}
                        <div className="flex justify-end space-x-3 pt-4">
                          <button className="px-6 py-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-50">
                            Back
                          </button>
                          <button className="px-6 py-2 bg-[#62c554] text-white rounded hover:bg-green-600">
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
      </div>
    </div>
  );
}
