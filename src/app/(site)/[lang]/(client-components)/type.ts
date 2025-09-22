// Refactored to use participants instead of guests

export interface ParticipantsObject {
	totalParticipants: number; // Total participants (includes primary user and additional participants)
  }
  
  export type StaySearchFormFields = "location" | "participants" | "dates";
  
  export interface PropertyType {
	name: string;
	description: string;
	checked: boolean;
  }
  
  export interface ClassOfProperties extends PropertyType {}
  
  export type DateRange = [Date | null, Date | null];
  