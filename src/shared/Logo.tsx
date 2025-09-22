import React from "react";
import Link from "next/link";

interface LogoProps {
	className?: string;
}

const Logo: React.FC<LogoProps> = ({
	className = "w-24",
}) => {
	return (
		<Link
			href="/"
			className={`ttnc-logo text-primary-6000 inline-block focus:outline-none focus:ring-0 ${className}`}
		>
			<img
				src="/images/logo/logo.svg"
				alt="Logo"
				className="max-h-12"
			/>
		</Link>
	);
};

export default Logo;