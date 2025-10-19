// import { Price } from "@/types/priceItem";

export default function PurchaseTable({ data }: unknown) {
	return (
		<div className='rounded-10 shadow-1  bg-white'>
			<div>
				<table className='w-full'>
					<thead className='border-stroke  border-b'>
						<tr>
							<th className='pl-7.5 font-satoshi text-body  p-5 text-left text-base font-medium tracking-[-.2px] sm:min-w-[200px]'>
								Plan
							</th>
							<th className='font-satoshi text-body  hidden p-5 text-left text-base font-medium tracking-[-.2px] xl:table-cell'>
								Next Billing Date
							</th>
							<th className='font-satoshi text-body  hidden p-5 text-left text-base font-medium tracking-[-.2px] md:table-cell'>
								Transaction ID
							</th>
							<th className='font-satoshi text-body  hidden p-5 text-left text-base font-medium tracking-[-.2px] xl:table-cell'>
								Total amount
							</th>
							<th className='pr-7.5 font-satoshi text-body  hidden p-5 text-right text-base font-medium tracking-[-.2px]'>
								Action
							</th>
						</tr>
					</thead>

					<tbody>
						<tr className='border-stroke  border-b last-of-type:border-none'>
							<td className='pl-7.5 text-dark p-5 text-left tracking-[-.16px] dark:text-white'>
								<span className='text-body  xl:hidden'>
									Name:{" "}
								</span>
								{data?.nickname}
								<span className='block xl:hidden'>
									<span className='text-body '>
										Next Billing Date:{" "}
									</span>
									{new Date(data?.currentPeriodEnd as Date).toDateString()}
								</span>
								<span className='block md:hidden'>
									<span className='text-body '>
										Transaction ID:
									</span>
									{data?.subscriptionId}
								</span>
								<span className='block xl:hidden'>
									<span className='text-body '>Amount:</span>$
									{data?.unit_amount / 100}{" "}
								</span>
							<span className='block xl:hidden'>
								<span className='text-body '>Action:</span>
								<button className='h-8.5 bg-brand-solid px-4.5 font-satoshi hover:bg-brand-solid_hover ml-auto flex items-center justify-center rounded-md text-sm font-medium tracking-[-.1px] text-white duration-300'>
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
							<button className='h-8.5 bg-brand-solid px-4.5 font-satoshi hover:bg-brand-solid_hover ml-auto flex items-center justify-center rounded-md text-sm font-medium tracking-[-.1px] text-white duration-300'>
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
