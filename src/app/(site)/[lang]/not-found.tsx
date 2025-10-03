import Link from "next/link";

export default function NotFound() {
	return (
		<div className='flex min-h-screen flex-col items-center justify-center'>
			<h2 className='mb-4 text-2xl font-bold'>Page not found</h2>
			<p className='mb-4'>The page you are looking for doesn't exist.</p>
			<Link href='/' className='text-blue-500 hover:text-blue-700'>
				Return Home
			</Link>
		</div>
	);
}
