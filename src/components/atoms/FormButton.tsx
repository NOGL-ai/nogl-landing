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
			className='flex w-full items-center justify-center gap-2 rounded-lg border-2 border-[rgba(255,255,255,0.12)] bg-[#7f56d9] px-4 py-2.5 text-[16px] font-semibold leading-6 text-white shadow-[inset_0px_0px_0px_1px_rgba(10,13,18,0.18),inset_0px_-2px_0px_0px_rgba(10,13,18,0.05),0px_1px_2px_0px_rgba(10,13,18,0.05)] duration-300 hover:bg-[#6941c6] disabled:cursor-not-allowed disabled:opacity-50'
			style={{ height: height }}
			disabled={disabled}
			onClick={onClick}
		>
			{children}
		</button>
	);
}
