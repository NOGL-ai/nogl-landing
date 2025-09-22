import VideoConferenceRedirect from '@/components/vc/VideoConferenceRedirect';

export default function VideoConferencePage() {
  // Commented out VC page to prevent performance issues
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Video Conference Temporarily Unavailable</h2>
      <p>This feature has been temporarily disabled for performance optimization.</p>
    </div>
  );
  
  /* Original implementation commented out:
  return <VideoConferenceRedirect />;
  */
}