"use client";
import { useState } from "react";
// import Sidebar from "@/components/Common/Dashboard/Sidebar"; // TODO: Fix sidebar import
import Header from "@/components/organisms/DashboardHeader";
import { userSidebarData } from "@/staticData/sidebarData";

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
	const [openSidebar, setOpenSidebar] = useState(false);

	return (
		<>
			<main className='bg-gray-2 min-h-screen dark:bg-[#151F34]'>
				<aside
					className={`dark:bg-gray-dark fixed left-0 top-0 z-[999] h-screen w-[290px] overflow-y-auto bg-white duration-300 ${
						openSidebar ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
					}`}
				>
					<Sidebar sidebarData={userSidebarData} />
				</aside>
				<div
					onClick={() => setOpenSidebar(false)}
					className={`bg-dark/80 fixed inset-0 z-[99] h-screen w-full lg:hidden ${
						openSidebar ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
					}`}
				></div>
				<section className='lg:ml-[290px]'>
					<Header openSidebar={openSidebar} setOpenSidebar={setOpenSidebar} />
					<div className='p-5 pt-12 md:p-10'>{children}</div>
				</section>
			</main>
		</>
	);
};

export default AdminLayout;
