"use client";
import toast from "react-hot-toast";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Loader from "@/components/Common/Loader";

const DemoSignin = () => {
	const router = useRouter();
	const [loading, setLoading] = useState({
		admin: false,
		user: false,
	});

	const handleLogin = (role: string) => {
		setLoading({ ...loading, [role]: true });

		let credentials;
		if (role == "admin") {
			credentials = {
				email: process.env.NEXT_PUBLIC_DEMO_ADMIN_MAIL,
				password: process.env.NEXT_PUBLIC_DEMO_ADMIN_PASS,
				remember: false,
			};
		} else {
			credentials = {
				email: process.env.NEXT_PUBLIC_DEMO_USER_MAIL,
				password: process.env.NEXT_PUBLIC_DEMO_USER_PASS,
				remember: false,
			};
		}

		signIn("credentials", {
			...credentials,
			redirect: false,
		}).then((callback) => {
			if (callback?.error) {
				toast.error(callback.error);

				setLoading({ ...loading, [role]: false });
			}

			if (callback?.ok && !callback?.error) {
				toast.success("Logged in successfully");
				router.push("/user");

				setLoading({ ...loading, [role]: true });
			}
		});
	};

	return (
		<div className='mb-12.5'>
			<p className='font-satoshi text-dark pb-4 text-center text-base font-medium dark:text-white'>
				Or Continue as Demo User, Admin
			</p>

			<div className='flex items-center justify-center gap-3 text-center'>
				<button
					className='bg-primary hover:bg-primary-dark flex w-[120px] items-center justify-center gap-2 rounded-md px-5 py-2 text-white'
					onClick={() => handleLogin("user")}
				>
					User {loading.user && <Loader style='border-white' />}
				</button>
				<button
					onClick={() => handleLogin("admin")}
					className='bg-dark hover:bg-dark/90 dark:text-dark flex w-[120px] items-center justify-center gap-2 rounded-md px-5 py-2 text-white dark:bg-white dark:hover:bg-slate-200'
				>
					Admin{" "}
					{loading.admin && <Loader style='border-white dark:border-dark' />}
				</button>
			</div>
		</div>
	);
};

export default DemoSignin;
