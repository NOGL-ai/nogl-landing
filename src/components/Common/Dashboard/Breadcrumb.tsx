import Link from "next/link";

type PropsType = { pageTitle: string };

export default function Breadcrumb({ pageTitle }: PropsType) {
	return (
		<div className='mb-7.5 items-center justify-between md:flex'>
			<h2 className='font-satoshi text-dark mb-4 text-2xl font-bold md:mb-0 dark:text-white'>
				{pageTitle}
			</h2>

			<div>
				<ul className='flex items-center md:justify-end'>
					<li>
						<Link
							href='/'
							className='text-body hover:text-primary dark:text-gray-5 dark:hover:text-primary text-sm'
						>
							Home
						</Link>
					</li>

					<li className='text-body dark:text-gray-5 text-sm'>
						<span className='px-2'>/</span>
						{pageTitle}
					</li>
				</ul>
			</div>
		</div>
	);
}
