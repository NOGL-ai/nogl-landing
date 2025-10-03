export enum SessionType {
	ONE_ON_ONE = "ONE_ON_ONE",
	GROUP = "GROUP",
	WEBINAR = "WEBINAR",
}

export type SessionDataType = {
	id: string;
	title: string;
	featuredImage: string;
	galleryImgs: string[];
	price: number;
	reviewStart: number;
	reviewCount: number;
	like: boolean;
	sessionType: SessionType;
	sessionDuration: string;
	href: string;
	saleOff?: string;
	isAds: boolean;
	// Additional required fields
	ratings: number;
	category: string;
	isCircleCommunity: boolean;
	expertName: string;
	expertId: string;
	expertImage?: string;
	description: string;
	date: string;
};
