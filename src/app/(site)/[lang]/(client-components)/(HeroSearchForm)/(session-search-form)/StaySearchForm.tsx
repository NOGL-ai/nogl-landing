import React, { FC } from "react";
import LocationInput from "../LocationInput";
import GuestsInput from "../GuestsInput";
import StayDatesRangeInput from "./StayDatesRangeInput";

const StaySearchForm: FC<{}> = ({}) => {
	const renderForm = () => {
		return (
			<form className='relative mt-8 flex w-full rounded-full bg-white shadow-xl dark:bg-neutral-800 dark:shadow-2xl '>
				<LocationInput className='flex-[1.5]' />
				<div className='h-8 self-center border-r border-slate-200 dark:border-slate-700'></div>
				<StayDatesRangeInput className='flex-1' />
				<div className='h-8 self-center border-r border-slate-200 dark:border-slate-700'></div>
				<GuestsInput className='flex-1' />
			</form>
		);
	};

	return renderForm();
};

export default StaySearchForm;
