"use client";

export default function TextareaGroup(props: any) {
	const { name, label, value, placeholder, handleChange, rows } = props;

	return (
		<div>
			<label
				htmlFor={name}
				className='font-satoshi text-dark mb-2.5 block text-base font-medium dark:text-white'
			>
				{label}
			</label>
			<div className='relative'>
				<textarea
					placeholder={placeholder}
					value={value}
					onChange={handleChange}
					rows={rows}
					className={`border-gray-3 px-5.5 text-dark focus:shadow-input focus:ring-primary/20 dark:border-stroke-dark w-full resize-none rounded-lg border py-3 outline-none ring-offset-1 duration-300 focus:ring-2 dark:bg-transparent dark:text-white dark:focus:border-transparent`}
				/>
			</div>
		</div>
	);
}
