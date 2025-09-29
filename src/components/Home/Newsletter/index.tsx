"use client";
import { useState, useEffect } from "react";
import Script from 'next/script';
import Cookies from 'js-cookie';
import dynamic from 'next/dynamic'
import toast from "react-hot-toast";
import axios from "axios";
import { AnimatedSubscribeButton } from "@/components/ui/animated-subscribe-button";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Add this type declaration at the top of your file
declare global {
  interface Window {
    dojoRequire: any;
    mcjs: any; // Add this if you're using other Mailchimp features
  }
}

interface NewsletterProps {
  dictionary: {
    newsletter: {
      title: string;
      description: string;
      emailPlaceholder: string;
      buttonText: string;
      successMessage: string;
      errorMessage: string;
      invalidEmailMessage: string;
    };
  };
}

const World = dynamic(
  () => import('@/components/ui/globe').then(mod => ({ default: mod.World })),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    )
  }
)

// Add some sample globe data and config
const globeConfig = {
  pointSize: 1,
  globeColor: "#1d072e",
  showAtmosphere: true,
  atmosphereColor: "#ffffff",
  atmosphereAltitude: 0.1,
  emissive: "#000000",
  emissiveIntensity: 0.1,
  shininess: 0.9,
  polygonColor: "rgba(255,255,255,0.7)",
  ambientLight: "#ffffff",
  directionalLeftLight: "#ffffff",
  directionalTopLight: "#ffffff",
  pointLight: "#ffffff",
  arcTime: 1500,
  arcLength: 0.7,
  rings: 2,
  maxRings: 5,
  initialPosition: {
    lat: 20,
    lng: 0
  },
  autoRotate: true,
  autoRotateSpeed: 0.5
};
const colors = ["#06b6d4", "#3b82f6", "#6366f1"];
  const sampleData = [
    {
      order: 1,
      startLat: -19.885592,
      startLng: -43.951191,
      endLat: -22.9068,
      endLng: -43.1729,
      arcAlt: 0.1,
      color: colors[Math.floor(Math.random() * (colors.length - 1))],
    },
    {
      order: 1,
      startLat: 28.6139,
      startLng: 77.209,
      endLat: 3.139,
      endLng: 101.6869,
      arcAlt: 0.2,
      color: colors[Math.floor(Math.random() * (colors.length - 1))],
    },
    {
      order: 1,
      startLat: -19.885592,
      startLng: -43.951191,
      endLat: -1.303396,
      endLng: 36.852443,
      arcAlt: 0.5,
      color: colors[Math.floor(Math.random() * (colors.length - 1))],
    },
    {
      order: 2,
      startLat: 1.3521,
      startLng: 103.8198,
      endLat: 35.6762,
      endLng: 139.6503,
      arcAlt: 0.2,
      color: colors[Math.floor(Math.random() * (colors.length - 1))],
    },
    {
      order: 2,
      startLat: 51.5072,
      startLng: -0.1276,
      endLat: 3.139,
      endLng: 101.6869,
      arcAlt: 0.3,
      color: colors[Math.floor(Math.random() * (colors.length - 1))],
    },
    {
      order: 2,
      startLat: -15.785493,
      startLng: -47.909029,
      endLat: 36.162809,
      endLng: -115.119411,
      arcAlt: 0.3,
      color: colors[Math.floor(Math.random() * (colors.length - 1))],
    },
    {
      order: 3,
      startLat: -33.8688,
      startLng: 151.2093,
      endLat: 22.3193,
      endLng: 114.1694,
      arcAlt: 0.3,
      color: colors[Math.floor(Math.random() * (colors.length - 1))],
    },
    {
      order: 3,
      startLat: 21.3099,
      startLng: -157.8581,
      endLat: 40.7128,
      endLng: -74.006,
      arcAlt: 0.3,
      color: colors[Math.floor(Math.random() * (colors.length - 1))],
    },
    {
      order: 3,
      startLat: -6.2088,
      startLng: 106.8456,
      endLat: 51.5072,
      endLng: -0.1276,
      arcAlt: 0.3,
      color: colors[Math.floor(Math.random() * (colors.length - 1))],
    },
    {
      order: 4,
      startLat: 11.986597,
      startLng: 8.571831,
      endLat: -15.595412,
      endLng: -56.05918,
      arcAlt: 0.5,
      color: colors[Math.floor(Math.random() * (colors.length - 1))],
    },
    {
      order: 4,
      startLat: -34.6037,
      startLng: -58.3816,
      endLat: 22.3193,
      endLng: 114.1694,
      arcAlt: 0.7,
      color: colors[Math.floor(Math.random() * (colors.length - 1))],
    },
    {
      order: 4,
      startLat: 51.5072,
      startLng: -0.1276,
      endLat: 48.8566,
      endLng: -2.3522,
      arcAlt: 0.1,
      color: colors[Math.floor(Math.random() * (colors.length - 1))],
    },
    {
      order: 5,
      startLat: 14.5995,
      startLng: 120.9842,
      endLat: 51.5072,
      endLng: -0.1276,
      arcAlt: 0.3,
      color: colors[Math.floor(Math.random() * (colors.length - 1))],
    },
    {
      order: 5,
      startLat: 1.3521,
      startLng: 103.8198,
      endLat: -33.8688,
      endLng: 151.2093,
      arcAlt: 0.2,
      color: colors[Math.floor(Math.random() * (colors.length - 1))],
    },
    {
      order: 5,
      startLat: 34.0522,
      startLng: -118.2437,
      endLat: 48.8566,
      endLng: -2.3522,
      arcAlt: 0.2,
      color: colors[Math.floor(Math.random() * (colors.length - 1))],
    },
    {
      order: 6,
      startLat: -15.432563,
      startLng: 28.315853,
      endLat: 1.094136,
      endLng: -63.34546,
      arcAlt: 0.7,
      color: colors[Math.floor(Math.random() * (colors.length - 1))],
    },
    {
      order: 6,
      startLat: 37.5665,
      startLng: 126.978,
      endLat: 35.6762,
      endLng: 139.6503,
      arcAlt: 0.1,
      color: colors[Math.floor(Math.random() * (colors.length - 1))],
    },
    {
      order: 6,
      startLat: 22.3193,
      startLng: 114.1694,
      endLat: 51.5072,
      endLng: -0.1276,
      arcAlt: 0.3,
      color: colors[Math.floor(Math.random() * (colors.length - 1))],
    },
    {
      order: 7,
      startLat: -19.885592,
      startLng: -43.951191,
      endLat: -15.595412,
      endLng: -56.05918,
      arcAlt: 0.1,
      color: colors[Math.floor(Math.random() * (colors.length - 1))],
    },
    {
      order: 7,
      startLat: 48.8566,
      startLng: -2.3522,
      endLat: 52.52,
      endLng: 13.405,
      arcAlt: 0.1,
      color: colors[Math.floor(Math.random() * (colors.length - 1))],
    },
    {
      order: 7,
      startLat: 52.52,
      startLng: 13.405,
      endLat: 34.0522,
      endLng: -118.2437,
      arcAlt: 0.2,
      color: colors[Math.floor(Math.random() * (colors.length - 1))],
    },
    {
      order: 8,
      startLat: -8.833221,
      startLng: 13.264837,
      endLat: -33.936138,
      endLng: 18.436529,
      arcAlt: 0.2,
      color: colors[Math.floor(Math.random() * (colors.length - 1))],
    },
    {
      order: 8,
      startLat: 49.2827,
      startLng: -123.1207,
      endLat: 52.3676,
      endLng: 4.9041,
      arcAlt: 0.2,
      color: colors[Math.floor(Math.random() * (colors.length - 1))],
    },
    {
      order: 8,
      startLat: 1.3521,
      startLng: 103.8198,
      endLat: 40.7128,
      endLng: -74.006,
      arcAlt: 0.5,
      color: colors[Math.floor(Math.random() * (colors.length - 1))],
    },
    {
      order: 9,
      startLat: 51.5072,
      startLng: -0.1276,
      endLat: 34.0522,
      endLng: -118.2437,
      arcAlt: 0.2,
      color: colors[Math.floor(Math.random() * (colors.length - 1))],
    },
    {
      order: 9,
      startLat: 22.3193,
      startLng: 114.1694,
      endLat: -22.9068,
      endLng: -43.1729,
      arcAlt: 0.7,
      color: colors[Math.floor(Math.random() * (colors.length - 1))],
    },
    {
      order: 9,
      startLat: 1.3521,
      startLng: 103.8198,
      endLat: -34.6037,
      endLng: -58.3816,
      arcAlt: 0.5,
      color: colors[Math.floor(Math.random() * (colors.length - 1))],
    },
    {
      order: 10,
      startLat: -22.9068,
      startLng: -43.1729,
      endLat: 28.6139,
      endLng: 77.209,
      arcAlt: 0.7,
      color: colors[Math.floor(Math.random() * (colors.length - 1))],
    },
    {
      order: 10,
      startLat: 34.0522,
      startLng: -118.2437,
      endLat: 31.2304,
      endLng: 121.4737,
      arcAlt: 0.3,
      color: colors[Math.floor(Math.random() * (colors.length - 1))],
    },
    {
      order: 10,
      startLat: -6.2088,
      startLng: 106.8456,
      endLat: 52.3676,
      endLng: 4.9041,
      arcAlt: 0.3,
      color: colors[Math.floor(Math.random() * (colors.length - 1))],
    },
    {
      order: 11,
      startLat: 41.9028,
      startLng: 12.4964,
      endLat: 34.0522,
      endLng: -118.2437,
      arcAlt: 0.2,
      color: colors[Math.floor(Math.random() * (colors.length - 1))],
    },
    {
      order: 11,
      startLat: -6.2088,
      startLng: 106.8456,
      endLat: 31.2304,
      endLng: 121.4737,
      arcAlt: 0.2,
      color: colors[Math.floor(Math.random() * (colors.length - 1))],
    },
    {
      order: 11,
      startLat: 22.3193,
      startLng: 114.1694,
      endLat: 1.3521,
      endLng: 103.8198,
      arcAlt: 0.2,
      color: colors[Math.floor(Math.random() * (colors.length - 1))],
    },
    {
      order: 12,
      startLat: 34.0522,
      startLng: -118.2437,
      endLat: 37.7749,
      endLng: -122.4194,
      arcAlt: 0.1,
      color: colors[Math.floor(Math.random() * (colors.length - 1))],
    },
    {
      order: 12,
      startLat: 35.6762,
      startLng: 139.6503,
      endLat: 22.3193,
      endLng: 114.1694,
      arcAlt: 0.2,
      color: colors[Math.floor(Math.random() * (colors.length - 1))],
    },
    {
      order: 12,
      startLat: 22.3193,
      startLng: 114.1694,
      endLat: 34.0522,
      endLng: -118.2437,
      arcAlt: 0.3,
      color: colors[Math.floor(Math.random() * (colors.length - 1))],
    },
    {
      order: 13,
      startLat: 52.52,
      startLng: 13.405,
      endLat: 22.3193,
      endLng: 114.1694,
      arcAlt: 0.3,
      color: colors[Math.floor(Math.random() * (colors.length - 1))],
    },
    {
      order: 13,
      startLat: 11.986597,
      startLng: 8.571831,
      endLat: 35.6762,
      endLng: 139.6503,
      arcAlt: 0.3,
      color: colors[Math.floor(Math.random() * (colors.length - 1))],
    },
    {
      order: 13,
      startLat: -22.9068,
      startLng: -43.1729,
      endLat: -34.6037,
      endLng: -58.3816,
      arcAlt: 0.1,
      color: colors[Math.floor(Math.random() * (colors.length - 1))],
    },
    {
      order: 14,
      startLat: -33.936138,
      startLng: 18.436529,
      endLat: 21.395643,
      endLng: 39.883798,
      arcAlt: 0.3,
      color: colors[Math.floor(Math.random() * (colors.length - 1))],
    },
  ];

export default function Newsletter({ dictionary }: NewsletterProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasSeenPopup, setHasSeenPopup] = useState(true); // Start true to prevent flash

  useEffect(() => {
    // Check if user has seen the popup before
    const popupSeen = Cookies.get('mailchimp_popup_seen');
    if (!popupSeen) {
      setHasSeenPopup(false);
      // Set cookie that expires in 30 days
      Cookies.set('mailchimp_popup_seen', 'true', { expires: 30 });
    }
  }, []);

  // Add Mailchimp popup script
  useEffect(() => {
    if (!hasSeenPopup && typeof window.dojoRequire !== 'undefined') {
      window.dojoRequire(["mojo/signup-forms/Loader"], function(L: any) { 
        L.start({
          "baseUrl": "us16.list-manage.com",
          "uuid": "730e2a5d4570de0714aa9bc71",
          "lid": "f6c410cdc0",
          "uniqueMethods": true
        });
      });
    }
  }, [hasSeenPopup]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);

    if (!email || email === "") {
      toast.error(dictionary.newsletter.errorMessage);
      setIsLoading(false);
      return;
    }

    // Simple email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error(dictionary.newsletter.invalidEmailMessage);
      setIsLoading(false);
      return;
    }

    try {
      const res = await axios.post("/api/newsletter", { email });

      if (res.data.status === 400) {
        toast.error(res.data?.title);
        setEmail("");
      } else {
        toast.success(dictionary.newsletter.successMessage);
        setEmail("");
      }
    } catch (error: any) {
      toast.error(
        error.response?.data || dictionary.newsletter.errorMessage
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Remove this block since it's already in layout.tsx
      {!hasSeenPopup && (
        <Script
          id="mcjs"
          strategy="afterInteractive"
          src="https://chimpstatic.com/mcjs-connected/js/users/730e2a5d4570de0714aa9bc71/c2b0a256050dd1866548b97fd.js"
          onLoad={() => {
            console.log('Mailchimp script loaded');
          }}
          onError={(e) => {
            console.error('Error loading Mailchimp script:', e);
          }}
        />
      )} */}

      <section className="relative z-[5] overflow-hidden pt-32 py-10 sm:py-12 md:py-17.5 lg:py-[100px]">
        <div className="container mx-auto flex flex-col-reverse lg:flex-row items-center justify-between gap-8 lg:gap-12">
          {/* Left side - Text and Form */}
          <div className="w-full lg:w-1/2 lg:pr-10 px-4 sm:px-6 lg:px-0 flex flex-col gap-6">
            <div className="text-left max-w-[590px] mx-auto lg:mx-0 flex flex-col gap-4"> 
              <h2 className="mb-4 sm:mb-5 font-satoshi text-2xl sm:text-3xl lg:text-4xl font-bold text-black dark:text-white">
                {dictionary.newsletter.title}
              </h2>
              <p className="mb-8 sm:mb-10 text-base text-gray-600 dark:text-gray-300">
                {dictionary.newsletter.description}
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="relative flex w-full max-w-[490px] mx-auto lg:mx-0 flex-wrap"
            >
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                type="email"
                placeholder={dictionary.newsletter.emailPlaceholder}
                className="h-12 w-full rounded-full bg-gray-100 dark:bg-white/5 px-5 pr-[110px] sm:pr-[120px] outline-none border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm sm:text-base"
                aria-label={dictionary.newsletter.emailPlaceholder}
              />
              <div className="absolute right-1 top-1">
                <AnimatedSubscribeButton 
                  isLoading={isLoading}
                  className="h-10 min-w-[90px] sm:min-w-[100px] text-sm sm:text-base bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100"
                >
                  <span className="hidden sm:inline">{dictionary.newsletter.buttonText}</span>
                  <span className="sm:hidden">{dictionary.newsletter.buttonText}</span>
                </AnimatedSubscribeButton>
              </div>
            </form>
          </div>

          {/* Right side - Globe */}
          <div className="w-full lg:w-1/2 h-[300px] sm:h-[400px] md:h-[450px] lg:h-[500px]">
            <div className="w-full h-full max-w-[600px] mx-auto">
              <ErrorBoundary fallback={
                <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <div className="text-center">
                    <div className="text-gray-500 dark:text-gray-400 mb-2">🌍</div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Interactive Globe</p>
                  </div>
                </div>
              }>
                <World globeConfig={globeConfig} data={sampleData} />
              </ErrorBoundary>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
