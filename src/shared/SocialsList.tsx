import { SocialType } from "@/shared/SocialsShare";
import React, { FC } from "react";

export interface SocialsListProps {
	className?: string;
	itemClass?: string;
	socials?: SocialType[];
}

const socialsDemo: SocialType[] = [
    { name: "Facebook", icon: "lab la-facebook-square", href: "https://facebook.com/noglai" },
    { name: "Twitter", icon: "lab la-twitter", href: "https://twitter.com/noglai" },
    { name: "Youtube", icon: "lab la-youtube", href: "https://youtube.com/@noglai" },
    { name: "Instagram", icon: "lab la-instagram", href: "https://instagram.com/noglai" },
];

const SocialsList: FC<SocialsListProps> = ({
	className = "",
	itemClass = "block",
	socials = socialsDemo,
}) => {
	return (
		<nav
			className={`nc-SocialsList text-neutral-6000 flex space-x-2.5 text-2xl dark:text-neutral-300 ${className}`}
			data-nc-id='SocialsList'
                    aria-label={item.name}
                    title={item.name}
                >
			{socials.map((item, i) => (
				<a
					key={i}
					className={`${itemClass}`}
					href={item.href}
					target='_blank'
					rel='noopener noreferrer'
					title={item.name}
				>
					<i className={item.icon}></i>
				</a>
			))}
		</nav>
	);
};

export default SocialsList;
