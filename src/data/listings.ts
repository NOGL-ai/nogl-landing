import __stayListing from "./jsons/__stayListing.json";
import __carsListing from "./jsons/__carsListing.json";
import __experiencesListing from "./jsons/__experiencesListing.json";
import __sessionsListing from "./jsons/__sessionsListing.json";
import __expertsListing from "./jsons/__expertsListing.json"; 
import {
	DEMO_STAY_CATEGORIES,
	DEMO_EXPERIENCES_CATEGORIES,
	DEMO_SESSION_CATEGORIES,
	DEMO_EXPERT_CATEGORIES, // Added experts categories
} from "./taxonomies";
import { CarDataType, ExperiencesDataType, StayDataType, SessionDataType, ExpertDataType } from "./types";
import { DEMO_AUTHORS } from "./authors";
import car1 from "@/images/cars/1.png";
import car2 from "@/images/cars/2.png";
import car3 from "@/images/cars/3.png";
import car4 from "@/images/cars/4.png";
import car5 from "@/images/cars/5.png";
import car6 from "@/images/cars/6.png";
import car7 from "@/images/cars/7.png";
import car8 from "@/images/cars/8.png";
import car9 from "@/images/cars/9.png";
import car10 from "@/images/cars/10.png";
import car11 from "@/images/cars/11.png";
import car12 from "@/images/cars/12.png";
import car13 from "@/images/cars/13.png";
import car14 from "@/images/cars/14.png";
import car15 from "@/images/cars/15.png";
import car16 from "@/images/cars/16.png";
import { Route } from "@/routers/types";
const carsImgs = [
	car1,
	car2,
	car3,
	car4,
	car5,
	car6,
	car7,
	car8,
	car9,
	car10,
	car11,
	car12,
	car13,
	car14,
	car15,
	car16,
];

const DEMO_STAY_LISTINGS = __stayListing.map((post, index): StayDataType => {
	//  ##########  GET CATEGORY BY CAT ID ######## //
	const category = DEMO_SESSION_CATEGORIES.find(
		(taxonomy) => String(taxonomy.id) === String(post.listingCategoryId)
	);
	
	if (!category) {
		console.warn(`Category not found for listingCategoryId: ${post.listingCategoryId}`);
	}
	
	return {
		...post,
		id: `stayListing_${index}_`,
		saleOff: !index ? "-20% today" : post.saleOff,
		isAds: !index ? true : post.isAds,
		author: DEMO_AUTHORS.filter((user) => user.id === post.authorId)[0],
		listingCategory: category,
		href: post.href as Route,
	};
});

const DEMO_EXPERIENCES_LISTINGS = __experiencesListing.map(
	(post, index): ExperiencesDataType => {
		//  ##########  GET CATEGORY BY CAT ID ######## //
		const category = DEMO_EXPERIENCES_CATEGORIES.filter(
			(taxonomy) => taxonomy.id === post.listingCategoryId
		)[0];

		return {
			...post,
			id: `experiencesListing_${index}_`,
			saleOff: !index ? "-20% today" : post.saleOff,
			isAds: !index ? true : post.isAds,
			author: DEMO_AUTHORS.filter((user) => user.id === post.authorId)[0],
			listingCategory: category,
			href: post.href as Route,
		};
	}
);

const DEMO_CAR_LISTINGS = __carsListing.map((post, index): CarDataType => {
	//  ##########  GET CATEGORY BY CAT ID ######## //
	const category = DEMO_EXPERIENCES_CATEGORIES.filter(
		(taxonomy) => taxonomy.id === post.listingCategoryId
	)[0];

	return {
		...post,
		id: `carsListing_${index}_`,
		saleOff: !index ? "-20% today" : post.saleOff,
		isAds: !index ? true : post.isAds,
		author: DEMO_AUTHORS.filter((user) => user.id === post.authorId)[0],
		listingCategory: category,
		featuredImage: carsImgs[index],
		href: post.href as Route,
	};
});


const DEMO_SESSIONS_LISTINGS = __sessionsListing.map(
	(post, index): SessionDataType => {
		const category = DEMO_SESSION_CATEGORIES.find(
			(taxonomy) => String(taxonomy.id) === String(post.listingCategoryId)
		);

		// Calculate spots correctly
		const maxSpots = post.maxGuests || 0;
		const bookedSpots = post.currentGuests || 0;
		const availableSpots = Math.max(0, maxSpots - bookedSpots);

		// Parse duration correctly from "X hours" format
		const durationMatch = post.sessionDuration?.match(/(\d+\.?\d*)/);
		const durationHours = durationMatch ? parseFloat(durationMatch[1]) : 1;

		return {
			id: `sessionListing_${index}_`,
			featuredImage: post.featuredImage,
			galleryImgs: post.galleryImgs,
			title: post.title,
			href: post.href as Route,
			expertId: String(post.authorId),
			expertName: post.authorName,
			authorId: post.authorId,
			authorName: post.authorName,
			timing: {
				sessionStart: post.startTime,
				duration: durationHours  // Keep in hours
			},
			saleOff: post.saleOff || "",
			price: parseInt(post.price.replace("€", "")) || 0,
			reviews: {
				averageRating: post.reviewStart || 0,
				totalReviews: post.reviewCount || 0
			},
			categoryName: post.categoryName,
			isCircleCommunity: post.isCircleCommunity || false,
			availableSpots: availableSpots,
			bookedSpots: bookedSpots,
			maxParticipants: maxSpots,
			date: post.sessionDate,
			time: post.startTime,
			duration: durationHours  // Keep in hours
		};
	}
);

const DEMO_EXPERTS_LISTINGS: ExpertDataType[] = __expertsListing.map(
	(expert, index): ExpertDataType => {
		// Find the category based on listingCategoryId
		const category = DEMO_EXPERT_CATEGORIES.find(
			(taxonomy) => String(taxonomy.id) === String(expert.listingCategoryId)
		);

		return {
			...expert,
			id: expert.id,
			authorId: expert.authorId,
			authorName: expert.authorName,
			hostBio: expert.hostBio,
			listingCategoryId: expert.listingCategoryId,
			categoryName: expert.categoryName,
			title: expert.title,
			subtitle: expert.subtitle,
			featuredImage: expert.featuredImage,
			galleryImgs: expert.galleryImgs,
			reviewStart: expert.reviewStart,
			reviewCount: expert.reviewCount,
			currentGuests: expert.currentGuests,
			sessionType: expert.sessionType,
			prerequisites: expert.prerequisites,
			like: expert.like,
			tags: expert.tags,
			language: expert.language,
			isBookmarked: expert.isBookmarked,
			sharedCount: expert.sharedCount,
			sessionSummary: expert.sessionSummary,
			maxViewers: expert.maxViewers,
			recordedSession: expert.recordedSession,
			accessAfterEvent: expert.accessAfterEvent,
			bookingStatus: expert.bookingStatus,
			additionalResources: expert.additionalResources,
			eventLink: expert.eventLink,
			contactSupport: expert.contactSupport,
			href: expert.href as Route<string>,
		};
	}
);
  
  export { DEMO_STAY_LISTINGS, DEMO_EXPERIENCES_LISTINGS, DEMO_CAR_LISTINGS, DEMO_SESSIONS_LISTINGS, DEMO_EXPERTS_LISTINGS };
  