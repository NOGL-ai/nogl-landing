import Marquee from "@/components/MagicUI/marquee";
import Image from "next/image";

const companies = [
	"Google",
	"Microsoft",
	"Amazon",
	"Netflix",
	"YouTube",
	"Instagram",
	"Uber",
	"Spotify",
];

export default function Logos() {
	return (
		<section id='logos'>
			<div className='container mx-auto px-4 py-12 md:px-8'>
				<h3 className='bg-gradient-to-br from-black from-30% to-black/40 bg-clip-text text-center text-sm font-semibold uppercase tracking-wider text-transparent dark:from-white dark:to-white/40'>
					Trusted by Leading Teams
				</h3>
				<div className='relative mt-6'>
					<Marquee className='max-w-full [--duration:40s]'>
						{companies.map((logo, idx) => (
							<Image
								key={idx}
								width={112}
								height={40}
								src={`https://cdn.magicui.design/companies/${logo}.svg`}
								className='h-10 w-28 opacity-70 brightness-200 contrast-200 grayscale transition-opacity duration-300 hover:opacity-100 dark:opacity-90 dark:brightness-200'
								alt={logo}
							/>
						))}
					</Marquee>
				</div>
			</div>
		</section>
	);
}
