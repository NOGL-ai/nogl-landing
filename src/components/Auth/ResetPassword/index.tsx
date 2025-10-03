"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import FormButton from "@/components/Common/Dashboard/FormButton";
import InputGroup from "@/components/Common/Dashboard/InputGroup";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function ResetPassword({ token }: { token: string }) {
	const [data, setData] = useState({
		newPassword: "",
		ReNewPassword: "",
	});

	const [user, setUser] = useState({
		email: "",
	});

	const router = useRouter();

	useEffect(() => {
		const verifyToken = async () => {
			try {
				const res = await axios.post(`/api/forgot-password/verify-token`, {
					token,
				});

				if (res.status === 200) {
					setUser({
						email: res.data.email,
					});
				}
			} catch (error: unknown) {
				toast.error(error.response.data);
				router.push("/auth/forgot-password");
			}
		};

		verifyToken();
	}, [token]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setData({
			...data,
			[e.target.name]: e.target.value,
		});
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (data.newPassword === "") {
			toast.error("Please enter your password.");
			return;
		}

		try {
			const res = await axios.post(`/api/forgot-password/update`, {
				email: user?.email,
				password: data.newPassword,
			});

			if (res.status === 200) {
				toast.success(res.data);
				setData({ newPassword: "", ReNewPassword: "" });
				router.push("/auth/signin");
			}
		} catch (error: unknown) {
			toast.error(error.response.data);
		}
	};

	return (
		<>
			<div className='mx-auto w-full max-w-[400px] pb-20 pt-40'>
				<div className='mb-7.5 text-center'>
					<h3 className='font-satoshi text-heading-5 text-dark mb-4 font-bold dark:text-white'>
						Create New Password
					</h3>
					<p className='dark:text-gray-5 text-base'>
						Create new password to save your account
					</p>
				</div>

				<form onSubmit={handleSubmit}>
					<div className='space-y-4.5 mb-5'>
						<InputGroup
							label='New password'
							placeholder='Password'
							type='password'
							name='newPassword'
							height='50px'
							handleChange={handleChange}
							value={data.newPassword}
						/>
						<InputGroup
							label='Re-type new password'
							placeholder='Password'
							type='password'
							name='ReNewPassword'
							height='50px'
							handleChange={handleChange}
							value={data.ReNewPassword}
						/>

						<FormButton height='50px'>Create Password</FormButton>
					</div>

					<p className='font-satoshi text-dark text-center text-base font-medium dark:text-white'>
						Already have an account?{" "}
						<Link
							href='/auth/signin'
							className='text-primary ml-1 inline-block'
						>
							Sign In →
						</Link>
					</p>
				</form>
			</div>
		</>
	);
}
