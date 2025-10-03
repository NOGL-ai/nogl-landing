import SectionHeader from "@/components/Common/SectionHeader";
import TestimonialItem from "./TestimonialItem";
import testimonialData from "./testmonialsData";
const Testimonials = () => {
	return (
		<section className='z-1 bg-gray-1 py-17.5 lg:py-22.5 xl:py-27.5 relative overflow-hidden dark:bg-black'>
			{/* <!-- section title --> */}
			<SectionHeader
				title={"Loved by businesses worldwide."}
				description='Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent condimentum dictum euismod malesuada lacus, non consequat quam'
			/>

			<div className='z-1 relative mx-auto w-full max-w-[1170px] px-4 sm:px-8 xl:px-0'>
				<div className='gap-7.5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'>
					{/* <!-- 1st Column --> */}
					{testimonialData?.map((group, key) => {
						return (
							<div key={key} className='gap-7.5 flex flex-col'>
								{group?.map((item, key) => (
									<TestimonialItem data={item} key={key} />
								))}
							</div>
						);
					})}
					{/* <div className='flex flex-col gap-7.5'></div> */}
				</div>
			</div>
		</section>
	);
};

export default Testimonials;
