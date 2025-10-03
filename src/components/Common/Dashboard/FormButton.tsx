export default function FormButton({ height, children }: unknown) {
	return (
		<button
			type='submit'
			className='bg-primary-500 font-satoshi hover:bg-primary-600 border-primary-400 flex w-full items-center justify-center gap-2 rounded-lg border px-10 py-3.5 text-base font-medium tracking-[-.2px] text-white shadow-lg duration-300'
			style={{ height: height }}
		>
			{children}
		</button>
	);
}
