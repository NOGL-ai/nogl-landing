'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { Route } from '@/routers/types';

const VideoConferenceRedirect = () => {
  // Commented out VideoConferenceRedirect to prevent performance issues
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Video Conference Temporarily Unavailable</h2>
      <p>This feature has been temporarily disabled for performance optimization.</p>
    </div>
  );

  /* Original implementation commented out:
  const router = useRouter();

  useEffect(() => {
    // Generate a unique room ID using UUID
    const uniqueRoomId = uuidv4();
    
    // Redirect to the specific room URL
    router.push(`/vc/${uniqueRoomId}` as Route);
  }, [router]);

  return <div>Redirecting to video conference...</div>;
  */
};

export default VideoConferenceRedirect;