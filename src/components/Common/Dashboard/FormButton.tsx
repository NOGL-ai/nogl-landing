export default function FormButton({ height, children }: any) {
	return (
		<button
			type='submit'
			className='flex w-full items-center justify-center gap-2 rounded-lg bg-primary-500 px-10 py-3.5 font-satoshi text-base font-medium tracking-[-.2px] text-white duration-300 hover:bg-primary-600 shadow-lg border border-primary-400'
			style={{ height: height }}
		>
			{children}
		</button>
	);
}
