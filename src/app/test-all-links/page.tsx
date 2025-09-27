'use client';

import Link from 'next/link';
import GlassParticlePage from "@/components/layouts/GlassParticlePage";

const navigationLinks = [
  // Main Navigation
  { title: 'Dashboard', path: '/dashboard', category: 'Main Navigation' },
  { title: 'My Catalog', path: '/catalog', category: 'Main Navigation' },
  { title: 'Competitors', path: '/competitors', category: 'Main Navigation' },
  { title: 'Repricing', path: '/repricing', category: 'Main Navigation' },
  { title: 'Reports', path: '/reports', category: 'Main Navigation' },
  { title: 'Product Feed', path: '/product-feed', category: 'Main Navigation' },
  
  // Other Navigation
  { title: 'Settings', path: '/settings', category: 'Other Navigation' },
  { title: 'My Account', path: '/account', category: 'Other Navigation' },
  
  // Profile Dropdown
  { title: 'View Profile', path: '/profile', category: 'Profile Dropdown' },
  { title: 'Account Settings', path: '/account/settings', category: 'Profile Dropdown' },
  { title: 'Notifications', path: '/notifications', category: 'Profile Dropdown' },
];

export default function TestAllLinksPage() {
  const mainNav = navigationLinks.filter(link => link.category === 'Main Navigation');
  const otherNav = navigationLinks.filter(link => link.category === 'Other Navigation');
  const profileNav = navigationLinks.filter(link => link.category === 'Profile Dropdown');

  return (
    <GlassParticlePage>
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Navigation Links Test
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Test all sidebar navigation links to ensure they're working correctly.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Main Navigation */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Main Navigation
              </h2>
              <div className="space-y-2">
                {mainNav.map((link) => (
                  <Link
                    key={link.path}
                    href={link.path}
                    className="block p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    {link.title}
                  </Link>
                ))}
              </div>
            </div>

            {/* Other Navigation */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Other Navigation
              </h2>
              <div className="space-y-2">
                {otherNav.map((link) => (
                  <Link
                    key={link.path}
                    href={link.path}
                    className="block p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    {link.title}
                  </Link>
                ))}
              </div>
            </div>

            {/* Profile Dropdown */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Profile Dropdown
              </h2>
              <div className="space-y-2">
                {profileNav.map((link) => (
                  <Link
                    key={link.path}
                    href={link.path}
                    className="block p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    {link.title}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-16 text-center">
            <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border border-green-200 dark:border-green-800">
              <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
                ✅ All Navigation Links Created!
              </h3>
              <p className="text-green-700 dark:text-green-300">
                Click any link above to test the navigation. Each link now has its own dedicated page
                with proper metadata and SEO optimization.
              </p>
            </div>
          </div>
        </div>
      </div>
    </GlassParticlePage>
  );
}
