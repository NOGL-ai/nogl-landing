import React from "react";

interface FormButtonProps {
	height?: string;
	children: React.ReactNode;
	disabled?: boolean;
	onClick?: () => void;
}

export default function FormButton({ height, children, disabled, onClick }: FormButtonProps) {
	return (
		<button
			type='submit'
			className='bg-primary-500 font-satoshi hover:bg-primary-600 border-primary-400 flex w-full items-center justify-center gap-2 rounded-lg border px-10 py-3.5 text-base font-medium tracking-[-.2px] text-white shadow-lg duration-300 disabled:opacity-50 disabled:cursor-not-allowed'
			style={{ height: height }}
			disabled={disabled}
			onClick={onClick}
		>
			{children}
		</button>
	);
}
