'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jitsiConfig } from '@/libs/jitsiConfig'; // Adjust the import path if needed

const VideoConferencePage = ({ params }: { params: { roomId: string } }) => {
  // Commented out VideoConference component to prevent performance issues
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Video Conference Temporarily Unavailable</h2>
      <p>This feature has been temporarily disabled for performance optimization.</p>
    </div>
  );

  /* Original implementation commented out:
  const [api, setApi] = useState<any>(null);
  const [loadingError, setLoadingError] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!params.roomId) {
      router.push('/');
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://meet.jit.si/external_api.js';
    script.async = true;

    script.onload = () => {
      try {
        const jitsi = new (window as any).JitsiMeetExternalAPI('meet.jit.si', {
          roomName: params.roomId,
          parentNode: document.getElementById('jitsi-container'),
          width: '100%',
          height: '100%',
          configOverwrite: {
            ...jitsiConfig,
            // If there are any specific settings you'd like to override, you can do it here
          },
          interfaceConfigOverwrite: {
            filmStripOnly: jitsiConfig.filmStripOnly,
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            SHOW_BRAND_WATERMARK: false,
            DEFAULT_LOGO_URL: null,
          },
        });

        setApi(jitsi);
      } catch (error) {
        console.error('Failed to initialize Jitsi Meet API', error);
        setLoadingError(true);
      }
    };

    script.onerror = () => {
      console.error('Failed to load Jitsi Meet API script');
      setLoadingError(true);
    };

    document.body.appendChild(script);

    return () => {
      if (api) {
        api.dispose();
      }
      document.body.removeChild(script);
    };
  }, [params.roomId, router]);

  useEffect(() => {
    document.body.classList.add('video-conference-active');
    const header = document.querySelector('header');
    if (header) {
      header.style.display = 'none';
    }
    
    return () => {
      document.body.classList.remove('video-conference-active');
      const header = document.querySelector('header');
      if (header) {
        header.style.display = '';
      }
    };
  }, []);

  if (loadingError) {
    return <div>Failed to load the video conference. Please try again later.</div>;
  }

  return (
    <div 
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw', 
        height: '100vh',
        margin: 0,
        zIndex: 50 
      }}
    >
      {!api && <div>Loading Jitsi Meet API...</div>}
      <div 
        id="jitsi-container" 
        style={{ 
          width: '100%', 
          height: '100%',
          overflow: 'hidden'
        }} 
      />
    </div>
  );
  */
};

export default VideoConferencePage;