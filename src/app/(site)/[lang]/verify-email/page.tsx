'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
// Removed DOMPurify import - using validator for sanitization instead
import { ClipLoader } from 'react-spinners'; // Import spinner

// Custom hook for email verification
function useEmailVerification(token: string | null) {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    if (!token || token.trim() === '') {
      // Invalid token
      setStatus('error');
      return;
    }

    // Define async function inside useEffect
    const verifyEmail = async () => {
      try {
        const res = await fetch('/api/user/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        if (!res.ok) throw new Error(`Verification failed: ${res.statusText}`);

        setStatus('success');
      } catch (error) {
        console.error('Email verification failed:', error);
        setStatus('error');
      }
    };

    verifyEmail();
  }, [token]);

  return status;
}

export default function VerifyEmail() {
  const searchParams = useSearchParams() ?? new URLSearchParams();
  const router = useRouter();
  const tokenParam = searchParams.get('token');

  // Sanitize the token
  const token = tokenParam || null; // Removed DOMPurify sanitization

  const status = useEmailVerification(token);

  // Redirect to sign-in after successful verification
  useEffect(() => {
    if (status === 'success') {
      const timer = setTimeout(() => {
        router.push('/auth/signin');
      }, 3000); // Redirect after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [status, router]);

  return (
    <div
      className="flex min-h-screen items-center justify-center"
      aria-live="polite"
      aria-atomic="true"
    >
      {status === 'loading' && (
        <div role="status" className="flex flex-col items-center">
          {/* Enhanced Spinner */}
          <ClipLoader color="#2563EB" size={50} />
          <p className="mt-4 text-lg font-medium">Verifying your email...</p>
        </div>
      )}
      {status === 'success' && (
        <div className="text-center">
          <p>Email verified successfully! Redirecting to sign in...</p>
        </div>
      )}
      {status === 'error' && (
        <div role="alert" className="text-center">
          <p>Verification failed. Please try again or contact support.</p>
        </div>
      )}
    </div>
  );
}