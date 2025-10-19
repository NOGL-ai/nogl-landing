interface PlaceholderTabProps {
	title: string;
	description: string;
}

export function PlaceholderTab({ title, description }: PlaceholderTabProps) {
	return (
		<div className="flex flex-col gap-6 px-8 py-12">
			<div className="flex flex-col items-center justify-center gap-4 text-center">
				<h2 className="text-lg font-semibold text-gray-900 dark:text-white">
					{title}
				</h2>
				<p className="max-w-md text-sm text-tertiary">
					{description}
				</p>
			<div className="mt-4 rounded-lg bg-gray-100 px-4 py-8" aria-live="polite">
				<p className="text-sm text-gray-500">
					This section is coming soon
				</p>
			</div>
			</div>
		</div>
	);
}
