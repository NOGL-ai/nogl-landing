import { ReactNode } from "react";

export default function Card({
	children,
	className = "",
}: {
	children: ReactNode;
	className?: string;
}) {
	return (
		<div
			className={`rounded-10 shadow-1 dark:bg-gray-dark bg-white p-10 ${className}`}
		>
			{children}
		</div>
	);
}
