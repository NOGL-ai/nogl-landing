import React, { TextareaHTMLAttributes } from "react";

// eslint-disable-next-line react/display-name
const Textarea = React.forwardRef<
	HTMLTextAreaElement,
	TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className = "", children, ...args }, ref) => {
	return (
		<textarea
			ref={ref}
			className={`focus:border-primary-300 focus:ring-primary-200 dark:focus:ring-primary-6000 block w-full rounded-2xl border-neutral-200 bg-white text-sm focus:ring focus:ring-opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:focus:ring-opacity-25 ${className}`}
			rows={4}
			{...args}
		>
			{children}
		</textarea>
	);
});

export default Textarea;
