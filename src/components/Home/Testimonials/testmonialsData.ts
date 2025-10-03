import { Testimonial } from "@/types/testimonial";

const testimonialData: Testimonial[][] = [
	// Expert Testimonials
	[
		{
			id: 1,
			name: "Sarah Johnson",
			role: "Business Consultant",
			text: "This platform revolutionized the way I connect with clients. The AI-powered tools have streamlined my workflow, allowing me to focus more on delivering quality sessions. I've seen a 50% increase in client retention!",
			image: "/images/testimonial/author-01.png",
		},
		{
			id: 2,
			name: "Michael Lee",
			role: "Health Coach",
			text: "Since joining, I've expanded my client base significantly. The seamless booking system and interactive tools have made it easy to manage multiple clients and deliver personalized experiences.",
			image: "/images/testimonial/author-02.png",
		},
	],
	// User Testimonials
	[
		{
			id: 3,
			name: "Jessica White",
			role: "Entrepreneur",
			text: "Working with experts on this platform has been a game-changer for my business. The sessions are always insightful, and the convenience of booking and receiving transcriptions is unmatched.",
			image: "/images/testimonial/author-03.png",
		},
		{
			id: 4,
			name: "Tom Williams",
			role: "Small Business Owner",
			text: "I’ve found exactly the kind of expertise I needed to grow my business. The platform’s features make it easy to stay on top of all my sessions and apply the insights I gain immediately.",
			image: "/images/testimonial/author-04.png",
		},
	],
	// Mixed Testimonials
	[
		{
			id: 5,
			name: "Laura Bennett",
			role: "Wellness Expert",
			text: "This platform's AI-enhanced features have truly set me apart in the wellness industry. The automated transcriptions and session summaries save me hours of work, allowing me to focus on my clients.",
			image: "/images/testimonial/author-05.png",
		},
		{
			id: 6,
			name: "David Anderson",
			role: "Executive Coach",
			text: "I've been able to scale my coaching business thanks to this platform. The detailed analytics and easy-to-use interface have made it simple to manage my growing client list and increase my revenue.",
			image: "/images/testimonial/author-06.png",
		},
	],

];

export default testimonialData;
