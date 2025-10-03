// import { Price } from "@/types/priceItem";

export default function PurchaseTable({ data }: unknown) {
	return (
		<div className='rounded-10 shadow-1 dark:bg-gray-dark bg-white'>
			<div>
				<table className='w-full'>
					<thead className='border-stroke dark:border-stroke-dark border-b'>
						<tr>
							<th className='pl-7.5 font-satoshi text-body dark:text-gray-5 p-5 text-left text-base font-medium tracking-[-.2px] sm:min-w-[200px]'>
								Plan
							</th>
							<th className='font-satoshi text-body dark:text-gray-5 hidden p-5 text-left text-base font-medium tracking-[-.2px] xl:table-cell'>
								Next Billing Date
							</th>
							<th className='font-satoshi text-body dark:text-gray-5 hidden p-5 text-left text-base font-medium tracking-[-.2px] md:table-cell'>
								Transaction ID
							</th>
							<th className='font-satoshi text-body dark:text-gray-5 hidden p-5 text-left text-base font-medium tracking-[-.2px] xl:table-cell'>
								Total amount
							</th>
							<th className='pr-7.5 font-satoshi text-body dark:text-gray-5 hidden p-5 text-right text-base font-medium tracking-[-.2px]'>
								Action
							</th>
						</tr>
					</thead>

					<tbody>
						<tr className='border-stroke dark:border-stroke-dark border-b last-of-type:border-none'>
							<td className='pl-7.5 text-dark p-5 text-left tracking-[-.16px] dark:text-white'>
								<span className='text-body dark:text-gray-5 xl:hidden'>
									Name:{" "}
								</span>
								{data?.nickname}
								<span className='block xl:hidden'>
									<span className='text-body dark:text-gray-5'>
										Next Billing Date:{" "}
									</span>
									{new Date(data?.currentPeriodEnd as Date).toDateString()}
								</span>
								<span className='block md:hidden'>
									<span className='text-body dark:text-gray-5'>
										Transaction ID:
									</span>
									{data?.subscriptionId}
								</span>
								<span className='block xl:hidden'>
									<span className='text-body dark:text-gray-5'>Amount:</span>$
									{data?.unit_amount / 100}{" "}
								</span>
								<span className='block xl:hidden'>
									<span className='text-body dark:text-gray-5'>Action:</span>
									<button className='h-8.5 bg-primary px-4.5 font-satoshi hover:bg-primary-dark ml-auto flex items-center justify-center rounded-md text-sm font-medium tracking-[-.1px] text-white duration-300'>
										Download
									</button>
								</span>
							</td>
							<td className='text-dark hidden p-5 text-left tracking-[-.16px] xl:table-cell dark:text-white'>
								{new Date(data?.currentPeriodEnd as Date).toDateString()}
							</td>
							<td className='text-dark hidden p-5 text-left tracking-[-.16px] md:table-cell dark:text-white'>
								{data?.subscriptionId}
							</td>
							<td className='text-dark hidden p-5 text-left tracking-[-.16px] xl:table-cell dark:text-white'>
								${data?.unit_amount / 100}
							</td>
							<td className='pr-7.5 text-dark hidden p-5 text-right tracking-[-.16px] dark:text-white'>
								<button className='h-8.5 bg-primary px-4.5 font-satoshi hover:bg-primary-dark ml-auto flex items-center justify-center rounded-md text-sm font-medium tracking-[-.1px] text-white duration-300'>
									Download
								</button>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	);
}
