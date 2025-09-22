'use client'

import BackgroundSection from '@/components/BackgroundSection'
import ListingImageGallery from '@/components/listing-image-gallery/ListingImageGallery'
import SectionSliderNewCategories from '@/components/SectionSliderNewCategories'
import SectionSubscribe2 from '@/components/SectionSubscribe2'
import { usePathname } from 'next/navigation'
import { ReactNode, Suspense } from 'react'
import { imageGallery as listingStayImageGallery } from './listing-session-detail/constant'


const DetailLayout = ({ children }: { children: ReactNode }) => {
	const thisPathname = usePathname()

	const getImageGalleryListing = () => {
		if (thisPathname?.includes('/listing-session-detail')) {
			return listingStayImageGallery
		}
		return []
	}

	return (
		<div className="ListingDetailPage">
			<Suspense>
				<ListingImageGallery images={getImageGalleryListing()} />
			</Suspense>

			<div className="ListingDetailPage__content container">{children}</div>

			{/* OTHER SECTION */}
			<div className="container py-24 lg:py-32">
				<div className="relative py-16">
					<BackgroundSection />
					<SectionSliderNewCategories
						heading="Skills You Didn't Know You Required"
						subHeading="Explore the most trending skills"
						categoryCardType="card5"
						itemPerRow={5}
						sliderStyle="style2"
					/>
				</div>
				<SectionSubscribe2 className="pt-24 lg:pt-32" />
			</div>
		</div>
	)
}

export default DetailLayout
