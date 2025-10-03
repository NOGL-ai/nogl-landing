"use client";
import { useState } from "react";
import InputGroup from "@/components/Common/Dashboard/InputGroup";
import FormButton from "@/components/Common/Dashboard/FormButton";
import Loader from "@/components/Common/Loader";
import toast from "react-hot-toast";
import axios from "axios";
import { useSearchParams, useRouter } from "next/navigation";

const InvitedSignin = () => {
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);

	const router = useRouter();
	const searchParams = useSearchParams();
	const token = searchParams ? searchParams.get("token") : null;

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setPassword(e.target.value);
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		setLoading(true);
		if (!password) {
			return toast.error("Please enter your password.");
		}

		try {
			const res = await axios.post(`/api/user/invite/signin`, {
				password,
				token,
			});

			if (res.status === 200) {
				toast.success("Account created successfully");
				setPassword("");
				setLoading(false);
				router.push("/auth/signin");
			}
		} catch (error: unknown) {
			toast.error(error.response.data);
			setPassword("");
			setLoading(false);
			router.push("/auth/signin");
		}
	};

	return (
		<div className='mx-auto w-full max-w-[400px] px-4 py-10'>
			<div className='mb-7.5 text-center'>
				<h3 className='font-satoshi text-heading-5 text-dark mb-4 font-bold dark:text-white'>
					Invited Signin
				</h3>
				<p className='dark:text-gray-5 text-base'>
					Enter your password to sign in
				</p>
			</div>

			<form onSubmit={handleSubmit}>
				<div className='mb-5 space-y-4'>
					<InputGroup
						label='Password'
						placeholder='Enter your password'
						type='password'
						name='password'
						required
						height='50px'
						value={password}
						handleChange={handleChange}
					/>

					<FormButton height='50px'>
						{loading ? (
							<>
								Sign in <Loader style='border-white dark:border-dark' />
							</>
						) : (
							"Sign in"
						)}
					</FormButton>
				</div>
			</form>
		</div>
	);
};

export default InvitedSignin;
