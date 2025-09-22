import { ReactNode } from "react";

export default function Card({ children, className = '' }: { children: ReactNode, className?: string }) {
	return (
		<div className={`rounded-10 bg-white p-10 shadow-1 dark:bg-gray-dark ${className}`}>
			{children}
		</div>
	);
}
