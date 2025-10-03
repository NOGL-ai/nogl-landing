export interface StaySearchFormFields {
	location: string;
	checkIn: Date | null;
	checkOut: Date | null;
	guests: number;
}

export type SearchTab = "Stays" | "Experiences" | "Cars";
