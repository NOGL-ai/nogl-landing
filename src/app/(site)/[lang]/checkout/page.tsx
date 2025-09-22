// COMMENTED OUT - Checkout page disabled for build optimization
// import React from "react";
// import CheckOutPagePageMain from "./PageMain";

// COMMENTED OUT - Checkout component disabled for build optimization
/*
const page = () => {
	return <CheckOutPagePageMain />;
};
*/

// Placeholder component to prevent build errors
const page = () => {
	return (
		<div className="min-h-screen flex items-center justify-center">
			<div className="text-center">
				<h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
					Checkout Temporarily Unavailable
				</h1>
				<p className="text-gray-600 dark:text-gray-400">
					This feature has been temporarily disabled for build optimization.
				</p>
			</div>
		</div>
	);
};

export default page;
