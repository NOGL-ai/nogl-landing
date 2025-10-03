import React from "react";
import { useHits } from "react-instantsearch";

const EmptyState = () => {
	const { hits } = useHits();
	return (
		<>
			{hits?.length == 0 ? (
				<div className='p-8'>
					<p className='text-body-color text-center text-base'>
						Enter keywords to see the result ...
					</p>
				</div>
			) : null}
		</>
	);
};

export default EmptyState;
