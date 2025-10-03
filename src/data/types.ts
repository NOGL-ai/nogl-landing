import { Route } from "@/routers/types";
import { StaticImageData } from "next/image";

//  ######  CustomLink  ######## //
export interface CustomLink {
	label: string;
	href: Route | string;
	targetBlank?: boolean;
}

//  ##########  PostDataType ######## //
export interface TaxonomyType {
	id: string;
	href: string;
	name: string;
	taxonomy: string;
	count?: number;
	thumbnail: string;
}

export interface AuthorType {
	id: string | number;
	firstName: string;
	lastName: string;
	displayName: string;
	avatar: string | StaticImageData;
	bgImage?: string | StaticImageData;
	email?: string;
	count: number;
	desc: string;
	jobName: string;
	href: Route;
	starRating?: number;
}

export interface PostDataType {
	id: string | number;
	author: AuthorType;
	date: string;
	href: Route;
	categories: TaxonomyType[];
	title: string;
	featuredImage: StaticImageData | string;
	desc?: string;
	commentCount: number;
	viewdCount: number;
	readingTime: number;
	postType?: "standard" | "video" | "gallery" | "audio";
}

export type TwMainColor =
	| "pink"
	| "green"
	| "yellow"
	| "red"
	| "indigo"
	| "blue"
	| "purple"
	| "gray";

//
export interface StayDataType {
	id: string | number;
	author: AuthorType;
	date: string;
	href: Route;
	title: string;
	featuredImage: StaticImageData | string;
	commentCount: number;
	viewCount: number;
	address: string;
	reviewStart: number;
	reviewCount: number;
	like: boolean;
	galleryImgs: (StaticImageData | string)[];
	price: string;
	listingCategory: TaxonomyType;
	maxGuests: number;
	bedrooms: number;
	bathrooms: number;
	saleOff?: string | null;
	isAds: boolean | null;
	map: {
		lat: number;
		lng: number;
	};
}

//
export interface ExperiencesDataType {
	id: string | number;
	author: AuthorType;
	date: string;
	href: Route;
	title: string;
	featuredImage: StaticImageData | string;
	commentCount: number;
	viewCount: number;
	address: string;
	reviewStart: number;
	reviewCount: number;
	like: boolean;
	galleryImgs: (StaticImageData | string)[];
	price: string;
	listingCategory: TaxonomyType;
	maxGuests: number;
	saleOff?: string | null;
	isAds: boolean | null;
	map: {
		lat: number;
		lng: number;
	};
}

//
export interface CarDataType {
	id: string | number;
	author: AuthorType;
	date: string;
	href: Route;
	title: string;
	featuredImage: StaticImageData | string;
	commentCount: number;
	viewCount: number;
	address: string;
	reviewStart: number;
	reviewCount: number;
	like: boolean;
	galleryImgs: (StaticImageData | string)[];
	price: string;
	listingCategory: TaxonomyType;
	seats: number;
	gearshift: string;
	saleOff?: string | null;
	isAds: boolean | null;
	map: {
		lat: number;
		lng: number;
	};
}

//
export interface SessionDataType {
	id: string;
	featuredImage: string;
	galleryImgs: string[];
	sessionDuration: string;
	saleOff: string;
	ratings: number;
	reviewCount: number;
	category: string;
	isCircleCommunity: boolean;
	title: string;
	expertName: string;
	date: string;
	time: string;
	spotsAvailable: number;
	spotsBooked: number;
	price: number;
	href: Route;
	expertId: string | number;
	expert?: {
		id: string;
		firstName: string;
		lastName: string;
		expertise: string[];
		rating: number;
		isVerifiedExpert: boolean;
		bio: string;
	};
}

export interface ExpertDataType {
	id: string;
	authorId: number;
	authorName: string;
	hostBio: string;
	listingCategoryId: number;
	categoryName: string;
	title: string;
	subtitle: string;
	featuredImage: string;
	galleryImgs: string[];
	reviewStart: number;
	reviewCount: number;
	currentGuests: number;
	sessionType: string;
	prerequisites: string;
	like: boolean;
	tags: string[];
	language: string;
	isBookmarked: boolean;
	sharedCount: number;
	sessionSummary: string;
	maxViewers: number;
	recordedSession: boolean;
	accessAfterEvent: string;
	bookingStatus: string;
	additionalResources: string[];
	eventLink: string;
	contactSupport: string;
	href: Route;
	sessions: SessionDataType[];
	expertise: string[];
	rating: number;
	totalSessions: number;
	isVerifiedExpert: boolean;
	languages: string[];
}
