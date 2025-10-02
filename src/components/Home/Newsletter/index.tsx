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
        <div className="container mx-auto flex flex-col items-center justify-center">
          {/* Newsletter Content */}
          <div className="w-full max-w-2xl px-4 sm:px-6 lg:px-0 flex flex-col gap-6">
            <div className="text-center max-w-[590px] mx-auto flex flex-col gap-4"> 
              <h2 className="mb-4 sm:mb-5 font-satoshi text-2xl sm:text-3xl lg:text-4xl font-bold text-black dark:text-white">
                {dictionary.newsletter.title}
              </h2>
              <p className="mb-8 sm:mb-10 text-base text-gray-600 dark:text-gray-300">
                {dictionary.newsletter.description}
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="relative flex w-full max-w-[490px] mx-auto flex-wrap"
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

        </div>
      </section>
    </>
  );
}
