// COMMENTED OUT - Search page disabled for build optimization
// export default function SearchPage() {
//   return (
//     <div className="h-screen w-full">
//       <iframe
//         allowFullScreen
//         title="AI Chatbot"
//         role="dialog"
//         id="ICG-iframe"
//         allow="accelerometer; autoplay; camera; display-capture; encrypted-media; fullscreen; gamepad; geolocation; gyroscope; hid; identity-credentials-get; idle-detection; local-fonts; magnetometer; microphone; midi; otp-credentials; payment; picture-in-picture; publickey-credentials-get; screen-wake-lock; serial; storage-access; usb; window-management; xr-spatial-tracking"
//         sandbox="allow-forms allow-modals allow-orientation-lock allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-presentation allow-same-origin allow-scripts allow-top-navigation allow-top-navigation-by-user-activation"
//         src="https://app.insertchat.com/embed/cbc827dc-2917-449e-b9fa-a31929c30cd8"
//         className="block border-0 h-full w-full bg-white"
//       />
//     </div>
//   );
// }

// Placeholder component to prevent build errors
export default function SearchPage() {
	return (
		<div className='flex min-h-screen items-center justify-center'>
			<div className='text-center'>
				<h1 className='mb-4 text-2xl font-bold text-gray-900 dark:text-white'>
					Search Temporarily Unavailable
				</h1>
				<p className='text-gray-600 dark:text-gray-400'>
					This feature has been temporarily disabled for build optimization.
				</p>
			</div>
		</div>
	);
}
