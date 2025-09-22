import GhostContentAPI from '@tryghost/content-api';
import clientConfig from "./config/client-config";
// Ghost Content API methods
import { Blog } from "@/types/blog";

// Only create client if Ghost URL is configured (for builds without Ghost)
export const client = clientConfig.url ? new GhostContentAPI(clientConfig) : null;
// Ghost API helper functions

export function imageBuilder(source: string) {
	// Ghost images are typically full URLs
	return {
		url: () => source || '/placeholder-image.jpg'
	};
}

export const getPosts = async () => {
	if (!client) {
		console.warn('Ghost client not configured, returning empty posts');
		return [];
	}
	try {
		const posts = await client.posts.browse({
			include: ['tags', 'authors'],
			limit: 'all'
		});
		return posts;
	} catch (error) {
		console.error('Error fetching posts:', error);
		return [];
	}
};

export const getPostBySlug = async (slug: string) => {
	if (!client) {
		console.warn('Ghost client not configured, returning null');
		return null;
	}
	try {
		const post = await client.posts.read({ slug }, {
			include: ['tags', 'authors']
		});
		return post;
	} catch (error) {
		console.error('Error fetching post by slug:', error);
		return null;
	}
};

export const getPostsByTag = async (tag: string) => {
	if (!client) {
		console.warn('Ghost client not configured, returning empty posts');
		return [];
	}
	try {
		const posts = await client.posts.browse({
			filter: `tag:${tag}`,
			include: ['tags', 'authors']
		});
		return posts;
	} catch (error) {
		console.error('Error fetching posts by tag:', error);
		return [];
	}
};

export const getPostsByAuthor = async (slug: string) => {
	if (!client) {
		console.warn('Ghost client not configured, returning empty posts');
		return [];
	}
	try {
		const posts = await client.posts.browse({
			filter: `authors:${slug}`,
			include: ['tags', 'authors']
		});
		return posts;
	} catch (error) {
		console.error('Error fetching posts by author:', error);
		return [];
	}
};

export const getPostsByCategory = async (category: string) => {
	if (!client) {
		console.warn('Ghost client not configured, returning empty posts');
		return [];
	}
	try {
		const posts = await client.posts.browse({
			filter: `tag:${category}`,
			include: ['tags', 'authors']
		});
		return posts;
	} catch (error) {
		console.error('Error fetching posts by category:', error);
		return [];
	}
};

export const getAuthorBySlug = async (slug: string) => {
	if (!client) {
		console.warn('Ghost client not configured, returning null');
		return null;
	}
	try {
		const author = await client.authors.read({ slug });
		return author;
	} catch (error) {
		console.error('Error fetching author by slug:', error);
		return null;
	}
};
