import AccountButton from "./AccountButton";
import Notifications from "./NotificationMenu/Notifications";
import ThemeToggler from "./ThemeToggler";
import { useSession } from "next-auth/react";

export default function Header({ openSidebar, setOpenSidebar }: unknown) {
	const { data: session } = useSession();

	return (
		<div className='z-999 border-stroke dark:border-stroke-dark dark:bg-gray-dark sticky top-0 flex items-center justify-between border-b bg-white px-5 py-5 md:px-10'>
			<div onClick={() => setOpenSidebar(!openSidebar)} className='lg:hidden '>
				<span className='h-5.5 w-5.5 relative block cursor-pointer'>
					<span className='du-block absolute right-0 h-full w-full'>
						<span className='relative left-0 top-0 my-1 block h-0.5 w-full rounded-sm bg-black duration-200 ease-in-out dark:bg-white'></span>
						<span className='relative left-0 top-0 my-1 block h-0.5 w-full rounded-sm bg-black duration-200 ease-in-out dark:bg-white'></span>
						<span className='relative left-0 top-0 my-1 block h-0.5 w-full rounded-sm bg-black duration-200 ease-in-out dark:bg-white'></span>
					</span>
				</span>
			</div>
			<p className='font-satoshi text-dark hidden whitespace-nowrap text-xl font-medium capitalize lg:block dark:text-white'>
				Welcome {session?.user?.name}! 👋
			</p>

			<div className='flex w-full items-center justify-end gap-4'>
				<ThemeToggler />
				<Notifications role={session?.user?.role as string} />
				<AccountButton user={session?.user} />
			</div>
		</div>
	);
}
