export interface SessionWithExpert {
	id: string;
	title: string;
	description: string;
	price: number;
	duration: number;
	expertId: string;
	expertName: string;
	expertImage?: string;
	category: string;
	sessionType: string;
	maxParticipants: number;
	isAvailable: boolean;
	createdAt: Date;
	updatedAt: Date;
}
