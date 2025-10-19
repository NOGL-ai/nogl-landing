const arrowIcon = (
	<svg
		width='26'
		height='26'
		viewBox='0 0 16 16'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
	>
		<path
			fillRule='evenodd'
			clipRule='evenodd'
			d='M2.95339 5.67461C3.1331 5.46495 3.44875 5.44067 3.65841 5.62038L7.99968 9.34147L12.341 5.62038C12.5506 5.44067 12.8663 5.46495 13.046 5.67461C13.2257 5.88428 13.2014 6.19993 12.9917 6.37964L8.32508 10.3796C8.13783 10.5401 7.86153 10.5401 7.67429 10.3796L3.00762 6.37964C2.79796 6.19993 2.77368 5.88428 2.95339 5.67461Z'
			fill='currentColor'
		/>
	</svg>
);

export default function InputSelect(props: unknown) {
	const { name, label, options, onChange, value, required } = props;
	return (
		<div>
			<label
				htmlFor={name}
				className='font-satoshi text-dark mb-2.5 block text-base font-medium dark:text-white'
			>
				{label}
			</label>
			<div className='relative'>
				<select
					name={name}
					id='select'
					value={value}
					onChange={onChange}
					required={required}
					className='border-border pl-5.5 text-dark focus:shadow-input focus:ring-primary/20 dark:border-stroke-dark relative z-20 h-[52px] w-full appearance-none rounded-lg border bg-transparent py-3 outline-none  ring-offset-1 duration-300 dark:text-white dark:focus:border-transparent'
				>
					<option value='Select Option' className='dark:bg-dark'>
						Select option
					</option>
					{options?.map((option: unknown) => (
						<option
							key={option?.value}
							value={option?.value}
							className='dark:bg-dark'
						>
							{option?.label}
						</option>
					))}
				</select>
				<span className='right-5.5 absolute top-1/2 z-10 -translate-y-1/2'>
					{arrowIcon}
				</span>
			</div>
		</div>
	);
}
