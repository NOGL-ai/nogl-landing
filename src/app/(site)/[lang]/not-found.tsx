import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Page not found</h2>
      <p className="mb-4">The page you are looking for doesn't exist.</p>
      <Link 
        href="/" 
        className="text-blue-500 hover:text-blue-700"
      >
        Return Home
      </Link>
    </div>
  );
} 