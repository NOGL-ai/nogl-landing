"use client";
import React, { useEffect, useState } from "react";
import NcInputNumber from "@/components/NcInputNumber";
import { FC } from "react";
import { GuestsObject } from "../type";

export interface GuestsInputProps {
	defaultValue?: GuestsObject;
	onChange?: (data: GuestsObject) => void;
	className?: string;
}

const GuestsInput: FC<GuestsInputProps> = ({
	defaultValue,
	onChange,
	className = "",
}) => {
	const [guestAdultsInputValue, setGuestAdultsInputValue] = useState(
		defaultValue?.guestAdults || 0
	);
	const [guestChildrenInputValue, setGuestChildrenInputValue] = useState(
		defaultValue?.guestChildren || 0
	);
	const [guestInfantsInputValue, setGuestInfantsInputValue] = useState(
		defaultValue?.guestInfants || 0
	);

	useEffect(() => {
		setGuestAdultsInputValue(defaultValue?.guestAdults || 0);
	}, [defaultValue?.guestAdults]);
	useEffect(() => {
		setGuestChildrenInputValue(defaultValue?.guestChildren || 0);
	}, [defaultValue?.guestChildren]);
	useEffect(() => {
		setGuestInfantsInputValue(defaultValue?.guestInfants || 0);
	}, [defaultValue?.guestInfants]);

	const handleChangeData = (value: number, type: keyof GuestsObject) => {
		const newValue = {
			guestAdults: guestAdultsInputValue,
			guestChildren: guestChildrenInputValue,
			guestInfants: guestInfantsInputValue,
		};
		if (type === "guestAdults") {
			setGuestAdultsInputValue(value);
			newValue.guestAdults = value;
		}
		if (type === "guestChildren") {
			setGuestChildrenInputValue(value);
			newValue.guestChildren = value;
		}
		if (type === "guestInfants") {
			setGuestInfantsInputValue(value);
			newValue.guestInfants = value;
		}
		onChange && onChange(newValue);
	};

	return (
		<div className={`relative flex flex-col p-5 ${className}`}>
			<span className='mb-5 block text-xl font-semibold sm:text-2xl'>
				{`Who's coming?`}
			</span>
			<NcInputNumber
				className='w-full'
				defaultValue={guestAdultsInputValue}
				onChange={(value) => handleChangeData(value, "guestAdults")}
				max={20}
				label='Adults'
				desc='Ages 13 or above'
			/>
			<NcInputNumber
				className='mt-6 w-full'
				defaultValue={guestChildrenInputValue}
				onChange={(value) => handleChangeData(value, "guestChildren")}
				max={20}
				label='Children'
				desc='Ages 2–12'
			/>

			<NcInputNumber
				className='mt-6 w-full'
				defaultValue={guestInfantsInputValue}
				onChange={(value) => handleChangeData(value, "guestInfants")}
				max={20}
				label='Infants'
				desc='Ages 0–2'
			/>
		</div>
	);
};

export default GuestsInput;
