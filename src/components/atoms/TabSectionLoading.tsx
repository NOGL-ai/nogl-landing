// import { Skeleton } from "@/components/ui/skeleton";

export const TabSectionLoading = () => (
	<div className='space-y-4'>
		<div className='h-12 w-full animate-pulse rounded-xl bg-border' />
		<div className='grid grid-cols-3 gap-4'>
			{[1, 2, 3].map((i) => (
				<div
					key={i}
					className='h-[400px] animate-pulse rounded-xl bg-border'
				/>
			))}
		</div>
	</div>
);
