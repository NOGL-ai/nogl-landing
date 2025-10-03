"use client";

import React, { useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/solid";

interface BioSectionProps {
	shortBio: string;
	longBio?: string;
}

const BioSection: React.FC<BioSectionProps> = ({ shortBio, longBio }) => {
	const [isExpanded, setIsExpanded] = useState(false);

	// Don't render the button if there's no long bio
	if (!longBio) {
		return <p className='text-neutral-400/80'>{shortBio}</p>;
	}

	return (
		<div className='space-y-3'>
			{/* Short bio is always visible */}
			<p className='text-neutral-400/80'>{shortBio}</p>

			{/* Long bio with expand/collapse */}
			<div
				className={`relative overflow-hidden transition-all duration-300 ${
					isExpanded ? "max-h-[1000px]" : "max-h-0"
				}`}
			>
				<p className='text-neutral-400/80'>{longBio}</p>
			</div>

			<button
				onClick={() => setIsExpanded(!isExpanded)}
				className='inline-flex items-center gap-1 rounded-md border border-neutral-700 px-4 py-1 text-sm text-neutral-400 transition-all hover:bg-neutral-800 hover:text-white'
				aria-expanded={isExpanded}
				aria-controls='bio-text'
			>
				<span>{isExpanded ? "Show less" : "Read more"}</span>
				<ChevronDownIcon
					className={`h-4 w-4 transition-transform duration-200 ${
						isExpanded ? "rotate-180" : ""
					}`}
				/>
			</button>
		</div>
	);
};

export default BioSection;
