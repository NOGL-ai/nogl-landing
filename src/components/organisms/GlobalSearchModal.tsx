"use client";

import { algoliasearch } from "algoliasearch";
import React, { useEffect } from "react";
import { Hits, InstantSearch } from "react-instantsearch";
import CustomHits from "../atoms/CustomHits";
import SearchBox from "../atoms/CustomSearchBox";
import EmptyState from "../atoms/EmptyState";

const appID = process.env.NEXT_PUBLIC_ALGOLIA_PROJECT_ID || "";
const apiKEY = process.env.NEXT_PUBLIC_ALGOLIA_API_KEY || "";
const INDEX = process.env.NEXT_PUBLIC_ALGOLIA_INDEX || "";

// Only initialize Algolia client if credentials are provided
const algoliaClient = appID && apiKEY ? algoliasearch(appID, apiKEY) : null;

type Props = {
	searchModalOpen: boolean;
	setSearchModalOpen: (value: boolean) => void;
};

const GlobalSearchModal = (props: Props) => {
	const { searchModalOpen, setSearchModalOpen } = props;

	useEffect(() => {
		// closing modal while clicking outside
		function handleClickOutside(event: unknown) {
			if (!event.target.closest(".modal-content")) {
				setSearchModalOpen(false);
			}
		}

		if (searchModalOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [searchModalOpen, setSearchModalOpen]);

	// Don't render if Algolia is not configured
	if (!algoliaClient) {
		return null;
	}

	return (
		<>
			{searchModalOpen && (
				<div className='fixed left-0 top-0 z-[99999] flex h-full min-h-screen w-full justify-center bg-[rgba(94,93,93,0.25)] px-4 py-[12vh] backdrop-blur-sm'>
					<div className='modal-content relative w-full max-w-[600px] overflow-y-auto rounded-xl bg-white shadow-lg dark:bg-black'>
						<div>
							<InstantSearch
								// @ts-ignore
								insights={false}
								searchClient={algoliaClient}
								indexName={INDEX}
							>
								<SearchBox />
								<EmptyState />
								<Hits
									hitComponent={(props: unknown) => (
										<CustomHits
											{...props}
											setSearchModalOpen={setSearchModalOpen}
										/>
									)}
								/>
							</InstantSearch>
						</div>
					</div>
				</div>
			)}
		</>
	);
};

export default GlobalSearchModal;
