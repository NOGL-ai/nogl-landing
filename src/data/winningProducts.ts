/**
 * Mock data for Winning Products widget
 * Location coordinates use real longitude/latitude for Mapbox
 */

export interface WinningProductLocation {
	id: string;
	city: string;
	country: string;
	countryCode: string;
	website: string;
	coordinates: {
		lng: number; // Longitude (east-west)
		lat: number; // Latitude (north-south)
	};
}

export interface CountryBreakdown {
	country: string;
	code: string;
	percentage: number;
}

export interface WinningProductsData {
	totalCount: string;
	countryBreakdown: CountryBreakdown[];
	locations: WinningProductLocation[];
}

// Mock data matching Figma design
export const mockWinningProductsData: WinningProductsData = {
	totalCount: "1.2k",
	countryBreakdown: [
		{
			country: "Germany",
			code: "DE",
			percentage: 50,
		},
		{
			country: "France",
			code: "FR",
			percentage: 30,
		},
		{
			country: "Spain",
			code: "ES",
			percentage: 20,
		},
		{
			country: "Italy",
			code: "IT",
			percentage: 10,
		},
		{
			country: "Netherlands",
			code: "NL",
			percentage: 10,
		},
	],
	locations: [
		{
			id: "loc-1",
			city: "Munich",
			country: "Germany",
			countryCode: "DE",
			website: "acmecorp.com/shop",
			coordinates: { lng: 11.5820, lat: 48.1351 }, // Munich
		},
		{
			id: "loc-2",
			city: "Paris",
			country: "France",
			countryCode: "FR",
			website: "fashion-hub.fr",
			coordinates: { lng: 2.3522, lat: 48.8566 }, // Paris
		},
		{
			id: "loc-3",
			city: "Barcelona",
			country: "Spain",
			countryCode: "ES",
			website: "style-es.com",
			coordinates: { lng: 2.1734, lat: 41.3851 }, // Barcelona
		},
		{
			id: "loc-4",
			city: "Milan",
			country: "Italy",
			countryCode: "IT",
			website: "milano-fashion.it",
			coordinates: { lng: 9.1900, lat: 45.4642 }, // Milan
		},
		{
			id: "loc-5",
			city: "Amsterdam",
			country: "Netherlands",
			countryCode: "NL",
			website: "dutch-style.nl",
			coordinates: { lng: 4.9041, lat: 52.3676 }, // Amsterdam
		},
		{
			id: "loc-6",
			city: "Berlin",
			country: "Germany",
			countryCode: "DE",
			website: "berlin-wear.de",
			coordinates: { lng: 13.4050, lat: 52.5200 }, // Berlin
		},
	],
};

