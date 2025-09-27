"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Toggle from "@/components/ui/toggle";
import Input from "@/shared/Input";
import Select from "@/shared/Select";
import Badge from "@/shared/Badge";

// Icons
import { DocumentTextIcon } from "@heroicons/react/24/outline";
import { XMarkIcon, ArrowTopRightOnSquareIcon, ArrowUpIcon } from "@heroicons/react/16/solid";

interface DatafeedSettingsProps {
  className?: string;
}

const DatafeedSettings: React.FC<DatafeedSettingsProps> = ({ className = "" }) => {
  // State for all settings
  const [settings, setSettings] = useState({
    priceAdjustmentType: "Plus",
    priceAdjustmentValue: "22",
    useSKUAsCode: true,
    usePriceAsMAP: false,
    categoryFilter: ""
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Page Header */}
      <div className="flex items-center gap-3 p-5 md:p-8 bg-white dark:bg-gray-900 border-b border-stroke-soft-200 dark:border-gray-700">
        <div className="flex items-center justify-center w-12 h-12 bg-bg-weak-100 dark:bg-gray-800 rounded-full">
          <DocumentTextIcon className="w-6 h-6 text-text-sub-500 dark:text-gray-400" />
        </div>
        <div className="flex-1">
          <h1 className="text-lg font-medium text-text-main-900 dark:text-white leading-6 tracking-tight">
            Datafeed Settings
          </h1>
          <p className="text-sm text-text-sub-500 dark:text-gray-400 leading-5 tracking-tight">
            Manage how your catalog is imported and update every day
          </p>
        </div>
      </div>

      {/* Main Widgets Section */}
      <div className="p-5 md:p-8 bg-white dark:bg-gray-900">
        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          {/* Bigcommerce Connection Widget */}
          <Card className="flex-1 border border-stroke-soft-200 dark:border-gray-700 shadow-sm dark:bg-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-4 mb-3">
                <div className="flex-1">
                  <h3 className="text-base font-medium text-text-main-900 dark:text-white leading-6 tracking-tight">
                    Bigcommerce
                  </h3>
                  <div className="flex items-center gap-5 mt-1">
                    <span className="text-xs text-text-sub-500 dark:text-gray-400">
                      API Connection
                    </span>
                    <div className="flex items-center gap-1">
                      <XMarkIcon className="w-4 h-4 text-red-base" />
                      <span className="text-xs text-text-sub-500 dark:text-gray-400">
                        Disconnect
                      </span>
                    </div>
                  </div>
                </div>
                <div className="w-8 h-8">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <path d="M16.8601 18.2176H20.8961C22.0441 18.2176 22.7707 17.5856 22.7707 16.5709C22.7707 15.6149 22.0441 14.9256 20.8961 14.9256H16.8601C16.7267 14.9256 16.6107 15.0403 16.6107 15.1549V17.9883C16.6307 18.1216 16.7254 18.2176 16.8601 18.2176ZM16.8601 24.7456H21.0307C22.3121 24.7456 23.0774 24.0949 23.0774 22.9456C23.0774 21.9509 22.3507 21.1456 21.0307 21.1456H16.8601C16.7267 21.1456 16.6107 21.2616 16.6107 21.3763V24.4963C16.6307 24.6496 16.7254 24.7456 16.8601 24.7456ZM31.6267 0.0709307L19.6894 11.9776H21.6414C24.6827 11.9776 26.4814 13.8909 26.4814 15.9776C26.4814 17.6243 25.3721 18.8309 24.1854 19.3656C23.9947 19.4429 23.9947 19.7109 24.2041 19.7869C25.5814 20.3229 26.5574 21.7603 26.5574 23.4429C26.5574 25.8163 24.9707 27.7123 21.8907 27.7123H13.4347C13.3014 27.7123 13.1854 27.5976 13.1854 27.4829V18.4669L0.0827296 31.5203C-0.0906037 31.6936 0.0253963 31.9989 0.273396 31.9989H31.7814C31.8371 31.9982 31.8902 31.9758 31.9296 31.9365C31.969 31.8971 31.9914 31.8439 31.9921 31.7883V0.242931C32.0494 0.0322641 31.7814 -0.0824026 31.6281 0.0695974L31.6267 0.0709307Z" fill="currentColor" className="text-gray-900 dark:text-white"/>
                  </svg>
                </div>
              </div>
              
              <div className="flex items-center gap-4 mb-4">
                <span className="text-base font-medium text-text-main-900 dark:text-white">
                  225302 Products Imported
                </span>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-lighter dark:bg-red-900/20">
                  <XMarkIcon className="w-3 h-3 text-red-base" />
                  <span className="text-xs font-medium text-red-base uppercase tracking-wide">
                    9 Errors
                  </span>
                </div>
              </div>

              <div className="w-full h-1 bg-state-information rounded mb-4"></div>

              <div className="border-t border-stroke-soft-200 dark:border-gray-700 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-text-sub-500 dark:text-gray-400">
                    Last import 2 Years ago
                  </span>
                  <div className="flex items-center gap-1 text-xs text-state-information">
                    <span>Change Datafeed Import Method</span>
                    <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Imported Products Metrics Widget */}
          <Card className="flex-1 border border-stroke-soft-200 dark:border-gray-700 shadow-sm dark:bg-gray-800">
            <CardContent className="p-4">
              <div className="mb-9">
                <h3 className="text-base text-text-main-900 dark:text-white">
                  Imported Products <span className="text-sm text-text-soft-400 dark:text-gray-400">(last 24)</span>
                </h3>
              </div>
              
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-3">
                  <div className="text-4xl font-medium text-text-main-900 dark:text-white leading-tight tracking-tight">
                    225302
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 px-1 py-0.5 bg-Alerts-Success-0 dark:bg-green-900/20 border border-Alerts-Success-200/20 dark:border-green-700/20 rounded">
                      <ArrowUpIcon className="w-4 h-4 text-Alerts-Success-200" />
                      <span className="text-xs font-semibold text-Alerts-Success-200">+0%</span>
                    </div>
                    <span className="text-xs text-Greyscale-400 dark:text-gray-400">vs 2 Years ago</span>
                  </div>
                </div>
                
                <div className="w-64 h-16">
                  <svg width="251" height="69" viewBox="0 0 251 69" className="w-full h-full">
                    <defs>
                      <linearGradient id="chartGradient" x1="125.5" y1="26.3032" x2="125.5" y2="68">
                        <stop stopColor="#CFD1D3"/>
                        <stop offset="1" stopColor="#E4E5E7" stopOpacity="0"/>
                      </linearGradient>
                    </defs>
                    <path d="M3.83682 67.2947H0.352631C0.157878 67.2947 0 67.4526 0 67.6474C0 67.8421 0.157878 68 0.352631 68H217.5C236.002 68 251 53.0015 251 34.5V11.0677C251 5.50747 246.493 1 240.932 1C238.102 1 235.402 2.19148 233.495 4.28255L208.987 31.1469C207.02 33.3038 204.235 34.5328 201.315 34.5328C197.553 34.5328 194.085 32.498 192.25 29.2138L181.015 9.10759C178.218 4.10157 172.931 1 167.197 1C161.025 1 155.416 4.58707 152.828 10.1896L147.297 22.1592C143.811 29.7029 138.759 34.5328 130.449 34.5328C123.289 34.5328 114.106 38.1287 110.161 44.105L103.643 53.9808C101.767 56.8221 98.5904 58.5316 95.186 58.5316C91.7583 58.5316 88.5629 56.7987 86.6933 53.9257L77.5774 39.918C75.3915 36.5589 71.6555 34.5328 67.6478 34.5328C62.9946 34.5328 58.7722 31.8087 56.8541 27.5692L48.3343 8.73838C46.2027 4.02714 41.5106 1 36.3396 1C30.5227 1 25.3953 4.81735 23.7273 10.3899L7.51249 64.5582C7.02635 66.1822 5.53205 67.2947 3.83682 67.2947Z" 
                          fill="url(#chartGradient)" fillOpacity="0.12"/>
                    <path d="M0 68C3.96985 68 7.46679 65.3887 8.5942 61.5823L23.7562 10.3922C25.4061 4.82163 30.5238 1 36.3336 1C41.5046 1 46.1932 4.03798 48.3061 8.75768L56.8837 27.918C58.7825 32.1594 62.9959 34.8895 67.6429 34.8895C71.6508 34.8895 75.3842 36.9259 77.554 40.2957L86.7156 54.5235C88.57 57.4033 91.7606 59.1437 95.1859 59.1437C98.588 59.1437 101.76 57.4266 103.621 54.5782L110.203 44.4995C114.119 38.5038 123.3 34.8895 130.461 34.8895C138.76 34.8895 143.793 30.0485 147.244 22.501L152.866 10.2034C155.429 4.59637 161.028 1 167.193 1C172.926 1 178.206 4.11406 180.98 9.13093L192.276 29.5617C194.094 32.849 197.554 34.8895 201.31 34.8895C204.231 34.8895 207.016 33.652 208.973 31.4836L226.766 11.7717C232.956 4.91402 241.762 1 251 1" 
                          stroke="#375DFB" strokeWidth="2" fill="none"/>
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Feed Settings Section */}
      <div className="p-5 md:p-8 bg-white dark:bg-gray-900 border-t border-stroke-soft-200 dark:border-gray-700">
        <div className="mb-6">
          <h2 className="text-lg font-medium text-text-main-900 dark:text-white leading-6 tracking-tight">
            Feed Settings
          </h2>
          <p className="text-sm text-text-sub-500 dark:text-gray-400 leading-5 tracking-tight">
            Manage how your custom attribute
          </p>
        </div>

        <div className="space-y-6">
          {/* Import price Adjustment */}
          <div className="flex justify-between items-center py-4">
            <div className="flex-1 pr-8">
              <h3 className="text-sm font-medium text-text-main-900 dark:text-white leading-5 mb-1">
                Import price Adjustment
              </h3>
              <p className="text-xs text-text-sub-500 dark:text-gray-400 leading-4">
                Automatically adjusts imported by a set percentage.
              </p>
            </div>
            <div className="flex items-center gap-3 w-80">
              <div className="flex-1">
                <div className="relative">
                  <Select
                    value={settings.priceAdjustmentType}
                    onChange={(e) => handleSettingChange("priceAdjustmentType", e.target.value)}
                    className="h-10 text-sm border-stroke-soft-200 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white rounded-lg pr-8 appearance-none"
                    sizeClass="h-10 px-3"
                  >
                    <option value="Plus">Plus</option>
                    <option value="Minus">Minus</option>
                  </Select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-text-sub-500 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="w-28">
                <div className="flex border border-stroke-soft-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 overflow-hidden">
                  <Input
                    value={settings.priceAdjustmentValue}
                    onChange={(e) => handleSettingChange("priceAdjustmentValue", e.target.value)}
                    className="border-0 rounded-none h-10 text-sm flex-1 dark:bg-gray-800 dark:text-white"
                    sizeClass="h-10 px-3"
                    rounded="rounded-none"
                  />
                  <div className="flex items-center justify-center min-w-[40px] bg-bg-weak-100 dark:bg-gray-700 border-l border-stroke-soft-200 dark:border-gray-600">
                    <span className="text-sm text-colorblack-70 dark:text-gray-300 font-medium">%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-stroke-soft-200 dark:border-gray-700"></div>

          {/* Use SKU as Code */}
          <div className="flex justify-between items-center py-4">
            <div className="flex-1 pr-8">
              <h3 className="text-sm font-medium text-text-main-900 dark:text-white leading-5 mb-1">
                Use SKU as Code
              </h3>
              <p className="text-xs text-text-sub-500 dark:text-gray-400 leading-4">
                By activating this option your product's sku will be used also as product's code (EAN, GTIN)
              </p>
            </div>
            <Toggle
              checked={settings.useSKUAsCode}
              onChange={(checked) => handleSettingChange("useSKUAsCode", checked)}
            />
          </div>

          <div className="border-t border-stroke-soft-200 dark:border-gray-700"></div>

          {/* Use Price as MAP */}
          <div className="flex justify-between items-center py-4">
            <div className="flex-1 pr-8">
              <h3 className="text-sm font-medium text-text-main-900 dark:text-white leading-5 mb-1">
                Use Price as MAP
              </h3>
              <p className="text-xs text-text-sub-500 dark:text-gray-400 leading-4">
                By activating this option your product's PRICE will be also used as MAP
              </p>
            </div>
            <Toggle
              checked={settings.usePriceAsMAP}
              onChange={(checked) => handleSettingChange("usePriceAsMAP", checked)}
            />
          </div>

          <div className="border-t border-stroke-soft-200 dark:border-gray-700"></div>

          {/* Category Filter */}
          <div className="flex justify-between items-center py-4">
            <div className="flex-1 pr-8">
              <h3 className="text-sm font-medium text-text-main-900 dark:text-white leading-5 mb-1">
                Category Filter
              </h3>
              <p className="text-xs text-text-sub-500 dark:text-gray-400 leading-4">
                Using this option, only products with selected category names will be imported in Pricefy.
              </p>
            </div>
            <div className="w-80">
              <Input
                placeholder="Categories Names"
                value={settings.categoryFilter}
                onChange={(e) => handleSettingChange("categoryFilter", e.target.value)}
                className="h-10 text-sm border-stroke-soft-200 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white rounded-lg"
                sizeClass="h-10 px-3"
                rounded="rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatafeedSettings;
