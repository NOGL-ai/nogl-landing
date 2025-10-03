import React from "react";

interface InfoTagsProps {
	label: string;
	items: Array<{ text: string; subtext?: string }>;
	variant?: "neutral" | "blue";
}

const InfoTags: React.FC<InfoTagsProps> = ({
	label,
	items,
	variant = "neutral",
}) => {
	const baseClasses = "rounded-full px-3 py-1 text-sm";
	const variantClasses = {
		neutral: "bg-neutral-800/80 text-neutral-300",
		blue: "bg-blue-500/10 text-blue-500",
	};

	return (
		<div className='space-y-2'>
			<h3 className='text-sm font-medium text-neutral-400/80'>{label}</h3>
			<div className='flex flex-wrap gap-2'>
				{items.map((item, index) => (
					<div
						key={index}
						className={`${baseClasses} ${variantClasses[variant]}`}
					>
						<span>{item.text}</span>
						{item.subtext && (
							<span className='text-neutral-400'> · {item.subtext}</span>
						)}
					</div>
				))}
			</div>
		</div>
	);
};

export default InfoTags;
