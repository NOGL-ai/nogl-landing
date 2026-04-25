/**
 * Form schema for the multi-step brand onboarding flow.
 * Lives next to the components that use it (`useFormContext<BrandOnboardingForm>`).
 */
export interface BrandOnboardingForm {
	// Step 1: Brand basics
	name: string;
	slug: string;
	country: string;
	homepage_url?: string;

	// Step 2: Brand identity
	primary_color: string;
	/** Comma-separated input from the user; we split into product_terms on submit. */
	keywords_raw: string;

	// Step 3: Logo
	logo_asset_id?: string;
	logo_s3_key?: string;
	/** Local object URL for in-flow preview only (not persisted). */
	logo_preview_url?: string;
}
