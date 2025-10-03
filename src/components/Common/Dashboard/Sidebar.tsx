"use client";
import Logo from "@/shared/Logo";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function Sidebar({
	sidebarOthersData,
	sidebarData,
	sidebarRef,
}: any) {
	const pathname = usePathname();

	return (
		<>
			<div
				ref={sidebarRef}
				className='border-stroke dark:border-stroke-dark h-full border-r px-6 py-10'
			>
				<div className='mb-10'>
					<Logo size='lg' className='w-auto' />
				</div>
				<div className='mb-6'>
					<p className='font-satoshi text-body dark:text-gray-6 mb-4 text-sm font-medium uppercase'>
						Main menu
					</p>
					<ul className='space-y-2'>
						{sidebarData &&
							sidebarData?.map((item: any, key: number) => (
								<li key={key}>
									<Link
										href={`${item?.path}`}
										className={`font-satoshi flex w-full items-center gap-3 rounded-lg px-3.5 py-3 font-medium duration-300 ${
											pathname === `${item.path}`
												? "bg-primary text-primary bg-opacity-10 dark:bg-white dark:bg-opacity-10 dark:text-white"
												: "text-dark hover:bg-primary hover:text-primary dark:text-gray-5 hover:bg-opacity-10 dark:hover:bg-white dark:hover:bg-opacity-10 dark:hover:text-white"
										}`}
									>
										<span className='h-[24px] w-[24px]'>{item?.icon}</span>
										{item?.title}

										{item?.comingSoon && (
											<span
												className={`rounded-lg px-1.5 text-sm  ${
													pathname == `${item.path}`
														? "bg-white/[.08] text-white"
														: "bg-primary/[.08] text-primary"
												}`}
											>
												{" "}
												Soon
											</span>
										)}
									</Link>
								</li>
							))}
					</ul>
				</div>
				{sidebarOthersData && (
					<div>
						<p className='font-satoshi text-body dark:text-gray-6 mb-4 text-sm font-medium uppercase'>
							Others
						</p>
						<ul className='space-y-2'>
							{sidebarOthersData?.map((item: any) => (
								<li key={item?.id}>
									<Link
										href={`${item?.path}`}
										className={`font-satoshi flex w-full items-center gap-3 rounded-lg px-3.5 py-3 font-medium duration-300 ${
											pathname === `${item.path}`
												? "bg-primary text-primary bg-opacity-10 dark:bg-white dark:bg-opacity-10 dark:text-white"
												: "text-dark hover:bg-primary hover:text-primary dark:text-gray-5 hover:bg-opacity-10 dark:hover:bg-white dark:hover:bg-opacity-10 dark:hover:text-white"
										}`}
									>
										<span>{item?.icon}</span>
										{item?.title}
									</Link>
								</li>
							))}
						</ul>
					</div>
				)}
			</div>
		</>
	);
}
