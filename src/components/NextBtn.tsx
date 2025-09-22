import twFocusClass from "@/utils/twFocusClass";
import React, { ButtonHTMLAttributes, FC } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {}

const NextBtn: FC<Props> = ({ className = "w-10 h-10 text-lg", ...args }) => {
	return (
		<button
			className={`NextBtn ${className} dark:border-neutral-6000 inline-flex items-center justify-center rounded-full border border-neutral-200 bg-white hover:border-neutral-300 dark:bg-neutral-900 dark:hover:border-neutral-500 ${twFocusClass()}`}
			{...args}
		>
			<i className='las la-angle-right'></i>
		</button>
	);
};

export default NextBtn;
