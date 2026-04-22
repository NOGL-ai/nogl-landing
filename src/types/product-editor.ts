export type ProductEditorItem = {
	id: string;
	productId: string;
	title: string;
	company: string;
	productType: string;
	tags: string[];
};

export type ProductEditorListParams = {
	page?: number;
	pageSize?: number;
	company?: string;
	productType?: string;
	title?: string;
};

export type ProductEditorListResponse = {
	items: ProductEditorItem[];
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
	companies: string[];
	productTypes: string[];
};

export type ProductEditorBulkUpdatePayload = {
	productIds: string[];
	productType?: string;
	addTags?: string[];
	removeTags?: string[];
};

export type ProductEditorBulkUpdateResult = {
	updatedCount: number;
};
