'use client';

import React, { useState } from 'react';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronDownIcon,
  PlusIcon,
  XMarkIcon,
  InformationCircleIcon,
  EllipsisHorizontalIcon
} from '@heroicons/react/24/outline';
import AddCompetitorModal from '@/components/Common/Modals/AddCompetitorModal';

// This would normally be fetched from an API
const competitorsData = [
  {
    id: 1,
    selected: false,
    domain: {
      name: 'Amazon (DE)',
      logo: 'https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=40&h=40&fit=crop&auto=format'
    },
    monitoredUrls: 0,
    competitorDiscovery: 0,
    pricePosition: {
      lower: 0,
      equal: 0,
      higher: 0
    },
    alerts: 1,
    status: 'Active'
  },
  {
    id: 2,
    selected: false,
    domain: {
      name: 'Google Shopping (DE)',
      logo: 'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=40&h=40&fit=crop&auto=format'
    },
    monitoredUrls: 0,
    competitorDiscovery: 0,
    pricePosition: {
      lower: 0,
      equal: 0,
      higher: 0
    },
    alerts: 1,
    status: 'Active'
  },
  {
    id: 3,
    selected: false,
    domain: {
      name: 'Purelei.com',
      logo: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=40&h=40&fit=crop&auto=format'
    },
    monitoredUrls: 0,
    competitorDiscovery: 0,
    pricePosition: {
      lower: 0,
      equal: 0,
      higher: 0
    },
    alerts: 1,
    status: 'Active'
  }
];

interface CircularProgressProps {
  value: number;
  max: number;
  color: string;
  className?: string;
}

const CircularProgress: React.FC<CircularProgressProps> = ({ value, max, color, className = "" }) => {
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (value / max) * circumference;

  return (
    <div className={`relative ${className}`}>
      <svg className="w-10 h-10 transform -rotate-90" viewBox="0 0 40 40">
        <circle
          cx="20"
          cy="20"
          r={radius}
          stroke="#C3DDFD"
          strokeWidth="5"
          fill="none"
        />
        <circle
          cx="20"
          cy="20"
          r={radius}
          stroke={color}
          strokeWidth="5"
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-300"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-normal" style={{ color }}>{value}</span>
      </div>
    </div>
  );
};

interface StatusBadgeProps {
  status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  return (
    <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-green-50 border border-green-200">
      <div className="w-2 h-2 bg-green-500 rounded-full mr-1.5"></div>
      <span className="text-xs font-medium text-green-700">{status}</span>
    </div>
  );
};

interface ChannelBadgeProps {
  channel: string;
}

const ChannelBadge: React.FC<ChannelBadgeProps> = ({ channel }) => {
  const styles = channel === 'Marketplace'
    ? { bg: 'bg-blue-50', border: 'border-blue-200', dot: 'bg-blue-500', text: 'text-blue-700' }
    : channel === 'Shopping'
      ? { bg: 'bg-purple-50', border: 'border-purple-200', dot: 'bg-purple-500', text: 'text-purple-700' }
      : { bg: 'bg-gray-50', border: 'border-gray-200', dot: 'bg-gray-500', text: 'text-gray-700' };
  return (
    <div className={`inline-flex items-center px-2.5 py-1 rounded-full ${styles.bg} border ${styles.border}`}>
      <div className={`w-2 h-2 rounded-full mr-1.5 ${styles.dot}`}></div>
      <span className={`text-xs font-medium ${styles.text}`}>{channel}</span>
    </div>
  );
};

const getChannel = (name: string): string => {
  const n = name.toLowerCase();
  if (n.includes('amazon')) return 'Marketplace';
  if (n.includes('google shopping')) return 'Shopping';
  return 'E-commerce';
};

export default function CompetitorsPage() {
  const [competitors, setCompetitors] = useState(competitorsData);
  const [searchTerm, setSearchTerm] = useState('');
  const [showBanner, setShowBanner] = useState(true);
  const [selectAll, setSelectAll] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    setCompetitors(competitors.map(competitor => ({
      ...competitor,
      selected: newSelectAll
    })));
  };

  const handleSelectCompetitor = (id: number) => {
    setCompetitors(competitors.map(competitor =>
      competitor.id === id
        ? { ...competitor, selected: !competitor.selected }
        : competitor
    ));
  };

  const handleMarketplaceClick = () => {
    setShowAddModal(false);
    // TODO: Add marketplace-specific logic here
    console.log('Marketplace competitor selected');
  };

  const handleEcommerceClick = () => {
    setShowAddModal(false);
    // TODO: Add ecommerce-specific logic here
    console.log('Ecommerce competitor selected');
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto flex flex-col items-center gap-5">
      {/* Information Banner */}
      {showBanner && (
        <div className="w-full">
          <div className="flex items-center justify-between bg-gray-100 px-4 py-2 rounded-md">
            <div className="flex items-center gap-3">
              <InformationCircleIcon className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <span className="text-sm text-blue-600 font-normal">
                Unconfirmed matches, older than 30 days, have been archived. In case you need them please contact our online support.
              </span>
            </div>
            <button
              onClick={() => setShowBanner(false)}
              className="p-1 hover:bg-gray-200 rounded-md transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="w-full max-w-[1168px] flex flex-col gap-4">
        {/* Header Section */}
        <div className="flex flex-col gap-4">
          {/* Title and Controls */}
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <h1 className="text-lg font-normal text-gray-900 leading-7">
                Competitors
              </h1>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Search Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-4 w-4 text-gray-500" />
                </div>
                <input
                  type="text"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-3 py-2 border border-gray-300 rounded-md text-xs text-gray-600 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 w-[576px]"
                />
              </div>

              {/* Filters Button */}
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors">
                <FunnelIcon className="h-5 w-5 text-gray-500" />
                <span className="text-xs font-medium text-gray-700">Filters</span>
              </button>

              {/* Massive Actions Dropdown */}
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors">
                <span className="text-xs font-medium text-gray-700">Massive Actions</span>
                <ChevronDownIcon className="h-5 w-5 text-gray-700" />
              </button>

              {/* Add Competitor Button */}
              <button 
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                <PlusIcon className="h-4 w-4" />
                <span className="text-xs font-medium">Add Competitor</span>
              </button>
            </div>
          </div>

          {/* Description */}
          <div>
            <p className="text-sm text-gray-600 font-normal leading-5">
              Add and manage your competitors
            </p>
          </div>
        </div>

        {/* Table Section */}
        <div className="border-t border-gray-200 pt-4">
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            {/* Table Header */}
            <div className="flex bg-gray-50 border-b border-gray-200">
              <div className="flex items-center px-1 py-3 w-9">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className="w-4 h-4 border border-gray-300 rounded bg-white"
                />
              </div>
              <div className="px-1 py-3 w-[200px]">
                <span className="text-xs text-gray-600 font-normal">Competitor Domain</span>
              </div>
              <div className="px-1 py-3 w-[114px]">
                <span className="text-xs text-gray-600 font-normal">Monitored URLs</span>
              </div>
              <div className="px-1 py-3 w-[165px]">
                <span className="text-xs text-gray-600 font-normal">Competitor Discovery</span>
              </div>
              <div className="px-1 py-3 w-[140px]">
                <span className="text-xs text-gray-600 font-normal">Channel</span>
              </div>
              <div className="px-1 py-3 w-[237px]">
                <span className="text-xs text-gray-600 font-normal">Price Position</span>
              </div>
              <div className="px-1 py-3 w-[81px]">
                <span className="text-xs text-gray-600 font-normal">Alerts</span>
              </div>
              <div className="px-1 py-3 w-[115px]">
                <span className="text-xs text-gray-600 font-normal">Status</span>
              </div>
              <div className="px-1 py-3 w-[110px]">
                <span className="text-xs text-gray-600 font-normal">Compare</span>
              </div>
              <div className="px-1 py-3 w-[79px] text-center">
                <span className="text-xs text-gray-600 font-normal">Actions</span>
              </div>
            </div>

            {/* Table Body */}
            <div className="bg-white">
              {competitors.map((competitor, index) => (
                <div key={competitor.id} className="flex items-center border-b border-gray-100 last:border-b-0">
                  {/* Checkbox */}
                  <div className="flex items-center px-1 py-4 w-9">
                    <input
                      type="checkbox"
                      checked={competitor.selected}
                      onChange={() => handleSelectCompetitor(competitor.id)}
                      className="w-4 h-4 border border-gray-300 rounded bg-white"
                    />
                  </div>

                  {/* Domain */}
                  <div className="px-1 py-4 w-[200px]">
                    <div className="flex items-center gap-3">
                      <img
                        src={competitor.domain.logo}
                        alt={competitor.domain.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <span className="text-xs text-gray-600 font-normal">
                        {competitor.domain.name}
                      </span>
                    </div>
                  </div>

                  {/* Monitored URLs */}
                  <div className="px-1 py-4 w-[114px]">
                    <div className="flex items-center gap-3">
                      <CircularProgress
                        value={competitor.monitoredUrls}
                        max={100}
                        color="#3F83F8"
                      />
                      <button className="text-xs text-gray-600 font-normal hover:text-blue-600">
                        Show
                      </button>
                    </div>
                  </div>

                  {/* Competitor Discovery */}
                  <div className="px-1 py-4 w-[165px]">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10">
                        <div className="w-10 h-10 rounded-full border-4 border-purple-300 flex items-center justify-center">
                          <span className="text-xs font-normal text-purple-600">{competitor.competitorDiscovery}</span>
                        </div>
                      </div>
                      <button className="text-xs text-blue-600 font-medium underline hover:no-underline">
                        Show
                      </button>
                    </div>
                  </div>

                  {/* Channel */}
                  <div className="px-1 py-4 w-[140px]">
                    <ChannelBadge channel={getChannel(competitor.domain.name)} />
                  </div>

                  {/* Price Position */}
                  <div className="px-1 py-4 w-[237px]">
                    <div className="flex flex-col gap-1">
                      <div className="text-xs text-gray-600 font-normal">
                        {competitor.pricePosition.lower} Lower / {competitor.pricePosition.equal} Equal / {competitor.pricePosition.higher} Higher
                      </div>
                      <div className="w-44 h-2.5 bg-gray-200 rounded"></div>
                    </div>
                  </div>

                  {/* Alerts */}
                  <div className="px-1 py-4 w-[81px]">
                    <span className="text-xs text-gray-600 font-normal">
                      {competitor.alerts} Alerts
                    </span>
                  </div>

                  {/* Status */}
                  <div className="px-1 py-4 w-[115px]">
                    <StatusBadge status={competitor.status} />
                  </div>

                  {/* Compare */}
                  <div className="px-1 py-4 w-[110px] flex items-center">
                    {/* Derive a compare percentage from available data if present */}
                    {(() => {
                      const total = (competitor.pricePosition.lower + competitor.pricePosition.equal + competitor.pricePosition.higher);
                      const derived = total > 0 ? Math.round((competitor.pricePosition.equal / total) * 100) : undefined;
                      const percentage = Number.isFinite(derived) ? derived : (typeof (competitor as any).compare === 'number' ? Math.max(0, Math.min(100, (competitor as any).compare)) : 0);
                      return (
                        <CircularProgress value={percentage} max={100} color="#3F83F8" />
                      );
                    })()}
                  </div>

                  {/* Actions */}
                  <div className="px-1 py-4 w-[79px] flex justify-center">
                    <button className="p-3 hover:bg-gray-100 rounded-md transition-colors">
                      <EllipsisHorizontalIcon className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Competitor Modal */}
      <AddCompetitorModal
        showModal={showAddModal}
        setShowModal={setShowAddModal}
        onMarketplaceClick={handleMarketplaceClick}
        onEcommerceClick={handleEcommerceClick}
      />
    </div>
  );
}
