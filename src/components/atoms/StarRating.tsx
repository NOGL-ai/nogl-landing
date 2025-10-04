"use client";

import { StarIcon } from "@heroicons/react/24/solid";
import React, { FC, useEffect } from "react";
import { useState } from "react";

export interface FiveStarIconForRateProps {
	className?: string;
	iconClass?: string;
	defaultPoint?: number;
}

const FiveStarIconForRate: FC<FiveStarIconForRateProps> = ({
	className = "",
	iconClass = "w-4 h-4",
	defaultPoint = 5,
}) => {
	const [point, setPoint] = useState(defaultPoint);
	const [currentHover, setCurrentHover] = useState(0);

	return (
		<div
			key={defaultPoint} // Reset component when defaultPoint changes
			className={`nc-FiveStarIconForRate flex items-center text-neutral-300 ${className}`}
			data-nc-id='FiveStarIconForRate'
		>
			{[1, 2, 3, 4, 5].map((item) => {
				return (
					<StarIcon
						key={item}
						className={`${
							point >= item || currentHover >= item ? "text-yellow-500" : ""
						} ${iconClass}`}
						onMouseEnter={() => setCurrentHover(() => item)}
						onMouseLeave={() => setCurrentHover(() => 0)}
						onClick={() => setPoint(() => item)}
					/>
				);
			})}
		</div>
	);
};

export default FiveStarIconForRate;
