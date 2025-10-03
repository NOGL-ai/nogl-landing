import React, { FC } from "react";
import MainNav1 from "./MainNav1";
import MainNav2 from "./MainNav2";

export interface HeaderProps {
	navType?: "MainNav1" | "MainNav2";
	className?: string;
}

const Header: FC<HeaderProps> = ({ navType = "MainNav1", className = "" }) => {
	const renderNav = () => {
		switch (navType) {
			case "MainNav1":
				return <MainNav1 />;
			case "MainNav2":
				return <MainNav2 />;
			default:
				return <MainNav1 />;
		}
	};

	return (
		<div
			className={`nc-Header nc-header-bg sticky left-0 right-0 top-0 z-40 w-full ${className}`}
		>
			{renderNav()}
		</div>
	);
};

export default Header;
