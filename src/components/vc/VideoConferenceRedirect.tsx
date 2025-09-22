'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { Route } from '@/routers/types';

const VideoConferenceRedirect = () => {
  const router = useRouter();

  useEffect(() => {
    // Generate a unique room ID using UUID
    const uniqueRoomId = uuidv4();
    
    // Redirect to the specific room URL
    router.push(`/vc/${uniqueRoomId}` as Route);
  }, [router]);

  return <div>Redirecting to video conference...</div>;
};

export default VideoConferenceRedirect;