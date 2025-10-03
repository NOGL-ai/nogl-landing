import React from "react";

interface Language {
	name: string;
	level: string;
}

interface LanguageTagProps {
	languages: Language[];
}

const LanguageTag: React.FC<LanguageTagProps> = ({ languages }) => {
	if (!languages.length) return null;

	return (
		<div className='w-full space-y-2'>
			<h3 className='text-sm font-medium uppercase tracking-wider text-neutral-400'>
				Languages
			</h3>
			<div className='flex flex-wrap justify-center gap-2'>
				{languages.map((lang, index) => (
					<div
						key={index}
						className='flex items-center gap-1.5 rounded-full bg-neutral-800/50 px-3 py-1'
					>
						<span className='text-sm font-medium text-white'>{lang.name}</span>
						<span className='text-xs text-neutral-400'>•</span>
						<span className='text-xs text-neutral-400'>{lang.level}</span>
					</div>
				))}
			</div>
		</div>
	);
};

export default LanguageTag;
