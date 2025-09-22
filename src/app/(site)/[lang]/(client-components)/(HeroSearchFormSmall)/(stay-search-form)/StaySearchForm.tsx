import React, { FC } from "react";
import LocationInput from "../LocationInput";
import GuestsInput from "../GuestsInput";
import StayDatesRangeInput from "./StayDatesRangeInput";
import { StaySearchFormFields } from "../../type";

export interface StaySearchFormProps {
	defaultFieldFocus?: StaySearchFormFields;
}

const StaySearchForm: FC<StaySearchFormProps> = ({ defaultFieldFocus }) => {
	const renderForm = () => {
		return (
			<form className='relative flex rounded-full border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800'>
				<LocationInput
					// onInputDone={() => setDateFocused("startDate")}
					className='flex-[1.5]'
					autoFocus={defaultFieldFocus === "location"}
				/>
				<div className='h-8 self-center border-r border-slate-200 dark:border-slate-700'></div>
				<StayDatesRangeInput className='flex-[1.2]' />

				<div className='h-8 self-center border-r border-slate-200 dark:border-slate-700'></div>
				<GuestsInput
					className='flex-1'
					autoFocus={defaultFieldFocus === "guests"}
					submitLink='/listing-session'
				/>
			</form>
		);
	};

	return renderForm();
};

export default StaySearchForm;
