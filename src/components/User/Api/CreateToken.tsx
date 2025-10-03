"use client";
import Card from "@/components/atoms/Card";
import FormButton from "@/components/atoms/FormButton";
import InputGroup from "@/components/molecules/InputGroup";
import { createApiKey } from "@/actions/api-key";
import { useRef } from "react";
import toast from "react-hot-toast";

export default function CreateToken() {
	const ref = useRef<HTMLFormElement>(null);

	return (
		<div className='lg:w-2/6'>
			<Card>
				<div className='mb-6'>
					<h3 className='font-satoshi text-custom-2xl text-dark mb-2.5 font-bold tracking-[-.5px] dark:text-white'>
						Want to use the API?
					</h3>
					<p className='text-body'>Create a new token to get the access.</p>
				</div>

				<form
					ref={ref}
					action={async (formData) => {
						try {
							await createApiKey(formData.get("token") as string);
							toast.success("Token created successfully");
						} catch (error) {
							toast.error("Unable to create token");
						}

						ref.current?.reset();
					}}
					className='space-y-5.5'
				>
					<InputGroup
						label='Token name'
						name='token'
						placeholder='Enter a token name'
						type='text'
						required={true}
					/>

					<FormButton>Create Token</FormButton>
				</form>
			</Card>
		</div>
	);
}
