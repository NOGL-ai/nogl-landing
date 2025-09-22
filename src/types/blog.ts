// Ghost CMS types
export type Author = {
	name: string;
	profile_image?: string;
	bio?: string;
	slug: string;
	id?: string;
};

export type Blog = {
	id: string;
	title: string;
	slug: string;
	excerpt?: string;
	html: string;
	feature_image?: string;
	primary_author?: Author;
	tags?: any[];
	published_at: string;
};
