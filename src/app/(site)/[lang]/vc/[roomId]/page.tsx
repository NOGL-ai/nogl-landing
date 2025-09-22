'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { jitsiConfig } from '@/libs/jitsiConfig';
import VideoLoader from '@/components/Common/VideoLoader';

const DEBUG = process.env.NODE_ENV === 'development';

const VideoConferencePage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const params = useParams();
  const { roomId, lang } = params as { roomId?: string; lang?: string };

  const { data: session, status } = useSession();

  // References to store the Jitsi API, the script element, and a flag for initialization
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const jitsiApiRef = useRef<any>(null);
  const jitsiInitializedRef = useRef<boolean>(false);
  const jitsiScriptRef = useRef<HTMLScriptElement | null>(null);

  /**
   * Load the Jitsi script only if window.JitsiMeetExternalAPI is not already present.
   */
  const loadJitsiScript = useCallback((): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      // If the Jitsi script is already on the page, resolve immediately
      if (window.JitsiMeetExternalAPI) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://vc.nogl.ai/external_api.js';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Jitsi script'));

      // Append script to body
      document.body.appendChild(script);
      // Store reference so we can remove it on cleanup
      jitsiScriptRef.current = script;
    });
  }, []);

  /**
   * Main effect to:
   *  - Wait until NextAuth status is no longer "loading"
   *  - Check for a valid roomId
   *  - Load & initialize Jitsi if not already done
   *  - Cleanup Jitsi on unmount
   */
  useEffect(() => {
    if (status === 'loading') return;
    if (!roomId) {
      router.push(`/${lang}`);
      return;
    }

    // Prevent multiple initializations
    if (jitsiInitializedRef.current) {
      return;
    }

    const initializeJitsi = async () => {
      try {
        // Load the script if needed
        if (!window.JitsiMeetExternalAPI) {
          await loadJitsiScript();
        }

        // Ensure we have a container
        if (!jitsiContainerRef.current) {
          throw new Error('Jitsi container ref is not available.');
        }

        // Create the Jitsi External API instance
        const domain = 'vc.nogl.ai';
        const options = {
          roomName: roomId,
          parentNode: jitsiContainerRef.current,
          userInfo: {
            displayName: session?.user?.name || 'Guest User',
          },
          interfaceConfigOverwrite: {
            filmStripOnly: false,
            APP_NAME: 'Nogl',
            PROVIDER_NAME: 'Nogl',
          },
        };
        const api = new window.JitsiMeetExternalAPI(domain, options);

        // Listen for conference left event
        api.addEventListener('videoConferenceLeft', () => {
          if (DEBUG) console.log('Video conference left, redirecting to home');
          router.push(`/${lang}`);
        });

        // Store API in ref
        jitsiApiRef.current = api;
        jitsiInitializedRef.current = true;

        // Listen for conference joined event
        api.addEventListener('videoConferenceJoined', () => {
          if (DEBUG) console.log('Video conference joined');
        });

        if (DEBUG) console.log('Jitsi instance created:', api);

      } catch (err: any) {
        console.error('Error initializing Jitsi:', err);
        setError(err.message || 'An unknown error occurred');
        setLoading(false);
      }
    };

    initializeJitsi()
      .then(() => setLoading(false))
      .catch((err) => {
        console.error('Error initializing Jitsi:', err);
        setError(err.message || 'An unknown error occurred');
        setLoading(false);
      });

    // Cleanup on component unmount
    return () => {
      // Dispose of Jitsi if present
      if (jitsiApiRef.current) {
        if (DEBUG) console.log('Disposing Jitsi instance');
        jitsiApiRef.current.dispose();
        jitsiApiRef.current = null;
      }

      // Remove the Jitsi <script> from the DOM if we created it
      if (jitsiScriptRef.current) {
        if (DEBUG) console.log('Removing Jitsi script from DOM');
        document.body.removeChild(jitsiScriptRef.current);
        jitsiScriptRef.current = null;
      }
    };
  }, [roomId, lang, router, status, loadJitsiScript]);

  /**
   * Effect to hide site headers / sticky nav and
   * expand the Jitsi container to full screen
   */
  useEffect(() => {
    // Add class to body
    document.body.classList.add('video-conference-active');

    // Hide header elements
    const elements = document.querySelectorAll(
      'header, .nc-Header, .nc-Header-3, div[style*="height: 80px"], [class*="sticky"], [class*="fixed"]'
    );
    elements.forEach((element) => {
      if (element instanceof HTMLElement) {
        element.style.display = 'none';
      }
    });

    // Expand Jitsi container with iOS-friendly styles
    if (jitsiContainerRef.current) {
      jitsiContainerRef.current.style.position = 'absolute';
      jitsiContainerRef.current.style.top = '0';
      jitsiContainerRef.current.style.right = '0';
      jitsiContainerRef.current.style.bottom = '0';
      jitsiContainerRef.current.style.left = '0';
      jitsiContainerRef.current.style.height = '100svh';
      jitsiContainerRef.current.style.zIndex = '9999';
    }

    return () => {
      // Restore body and header elements
      document.body.classList.remove('video-conference-active');
      elements.forEach((element) => {
        if (element instanceof HTMLElement) {
          element.style.display = '';
        }
      });

      // Restore Jitsi container styles
      if (jitsiContainerRef.current) {
        jitsiContainerRef.current.style.position = '';
        jitsiContainerRef.current.style.top = '';
        jitsiContainerRef.current.style.right = '';
        jitsiContainerRef.current.style.bottom = '';
        jitsiContainerRef.current.style.left = '';
        jitsiContainerRef.current.style.height = '';
        jitsiContainerRef.current.style.zIndex = '';
      }
    };
  }, []);

  return (
    <div style={{ height: '100%' }}>
      {(status === 'loading' || loading) && (
        <VideoLoader 
          message="Preparing Your Video Space"
          subMessage="Setting up a secure connection..."
        />
      )}

      {error && (
        <div>
          <p>Oops! Something went wrong while initializing the video conference.</p>
          <p>{error}</p>
          <button onClick={() => router.push(`/${lang}`)}>Go Back Home</button>
        </div>
      )}

      {/* The Jitsi Meet container */}
      <div
        ref={jitsiContainerRef}
        id="jitsi-container"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default VideoConferencePage;
