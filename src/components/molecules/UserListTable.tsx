import { User } from "@prisma/client";
import UserAction from "./UserAction";
// import axios from "axios";

export default function UserListTable({ users }: { users: User[] }) {
	return (
		<>
			<div className='rounded-10 shadow-1 bg-white'>
				<table className='w-full'>
					<thead>
						<tr className='border-stroke dark:border-stroke-dark lsm:table-row hidden border-b'>
							<th className='font-satoshi text-body sm:pl-7.5 min-w-[150px] px-4 py-5 text-left text-base font-medium tracking-[-.2px]'>
								Name
							</th>
							<th className='font-satoshi text-body hidden px-4 py-5 text-left text-base font-medium tracking-[-.2px] xl:table-cell'>
								Email
							</th>
							<th className='font-satoshi text-body hidden px-4 py-5 text-left text-base font-medium tracking-[-.2px] xl:table-cell'>
								Role
							</th>
							<th className='font-satoshi text-body hidden px-4 py-5 text-left text-base font-medium tracking-[-.2px] md:table-cell'>
								Registered on
							</th>
							<th className='font-satoshi text-body lsm:table-cell sm:pr-7.5 hidden px-4 py-5 text-right text-base font-medium tracking-[-.2px]'>
								Action
							</th>
						</tr>
					</thead>

					<tbody>
						{users?.map((user) => (
							<tr
								key={user?.id}
								className='border-stroke dark:border-stroke-dark border-b last-of-type:border-b-0'
							>
								<td className='text-body sm:pl-7.5 p-4 text-left text-base tracking-[-.16px]'>
									{user?.name}

									{/* <span className='block xl:hidden'>Name: {user?.name}</span> */}

									<span className='block xl:hidden'>Email: {user?.email}</span>

									<span className='block xl:hidden'>
										Role:{" "}
										{user?.role &&
											user.role.charAt(0).toUpperCase() +
												user.role.slice(1).toLowerCase()}
									</span>

									<span className='block md:hidden'>
										Register Date: {user?.createdAt?.toLocaleDateString()}
									</span>

									<span className='lsm:hidden block'>
										<UserAction user={user} />
									</span>
								</td>

								<td className='text-body hidden p-4 text-left text-base tracking-[-.16px] xl:table-cell'>
									{user?.email}
								</td>
								<td className='text-body hidden p-4 text-left text-base tracking-[-.16px] xl:table-cell'>
									{user?.role &&
										user.role.charAt(0).toUpperCase() +
											user.role.slice(1).toLowerCase()}
								</td>
								<td className='text-body hidden p-4 text-left text-base tracking-[-.16px] md:table-cell'>
									{user?.createdAt?.toLocaleDateString()}
								</td>
								<td className='text-body lsm:table-cell sm:pr-7.5 hidden p-4 text-right text-base tracking-[-.16px]'>
									<UserAction user={user} />
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</>
	);
}
