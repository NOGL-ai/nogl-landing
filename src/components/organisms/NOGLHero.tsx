"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import localFont from "next/font/local";

const perfectDark = localFont({
	src: "../../fonts/PerfectDarkBRK.ttf",
	variable: "--font-perfect-dark",
	display: "swap",
});

const azonix = localFont({
	src: "../../fonts/Azonix.otf",
	variable: "--font-azonix",
	display: "swap",
});

export default function NOGLHero() {
	const videoRef1 = useRef<HTMLVideoElement>(null);
	const videoRef2 = useRef<HTMLVideoElement>(null);

	useEffect(() => {
		// Ensure videos autoplay
		if (videoRef1.current) {
			videoRef1.current.play().catch(() => {
				// Autoplay failed, user interaction required
			});
		}
		if (videoRef2.current) {
			videoRef2.current.play().catch(() => {
				// Autoplay failed, user interaction required
			});
		}
	}, []);

	return (
		<div className={`relative w-full h-[1080px] max-w-[1920px] mx-auto bg-gradient-to-b from-[#000000] to-[#0c0c0c] overflow-hidden ${perfectDark.variable} ${azonix.variable}`}>
			{/* Large "NEXTGENNOGL" title at bottom */}
			<div className="absolute left-[266px] top-[834px] w-[1389px] h-[217px]">
				<h1 
					className="text-white uppercase leading-normal text-[215.611px]"
					style={{ fontFamily: 'var(--font-perfect-dark)' }}
				>
					NEXTGENNOGL
				</h1>
			</div>

			{/* NOGL Logo top-left */}
			<div className="absolute left-[74px] top-[8px]">
				<p 
					className="text-white leading-normal text-[51.187px]"
					style={{ fontFamily: 'var(--font-perfect-dark)' }}
				>
					NOGL
				</p>
			</div>

			{/* Right-side content */}
			<div className="absolute left-[1307px] top-[521px] w-[321px]">
				<h2 
					className="text-white uppercase leading-normal mb-[26px] text-[27.305px]"
					style={{ fontFamily: 'var(--font-azonix)' }}
				>
					Powering the future with AI
				</h2>
				<p 
					className="text-[#95a1b4] leading-[1.5] w-[313px] text-[16px]"
				>
					We create intelligent solutions that transform data into strategic decisions.
				</p>
			</div>

			{/* Main video (top-right) */}
			<div 
				className="absolute rounded-full overflow-hidden"
				style={{
					left: 'calc(50% + 460px)',
					top: 'calc(50% - 163px)',
					transform: 'translate(-50%, -50%)',
					width: '226px',
					height: '226px'
				}}
			>
				<video
					ref={videoRef1}
					autoPlay
					loop
					muted
					playsInline
					className="w-full h-full object-cover"
				>
					<source src="/videos/ntx/main-video.mp4" type="video/mp4" />
				</video>
			</div>

			{/* Central wireframe 3D head image - CORRECT POSITION */}
			<div className="absolute left-[520px] top-[74px] w-[881px] h-[881px]">
				<div 
					className="w-full h-full mix-blend-luminosity"
					style={{
						maskImage: 'url(/images/hero/wireframe-mask.svg)',
						maskSize: '881px 881px',
						maskPosition: '0px 0px',
						maskRepeat: 'no-repeat',
						WebkitMaskImage: 'url(/images/hero/wireframe-mask.svg)',
						WebkitMaskSize: '881px 881px',
						WebkitMaskPosition: '0px 0px',
						WebkitMaskRepeat: 'no-repeat'
					}}
				>
					<Image
						src="/images/hero/b3a80f90df88de4b2428b2a401fe9a2eb6ffbafc.png"
						alt="Wireframe 3D Head"
						width={881}
						height={881}
						className="object-cover w-full h-full"
					/>
				</div>
			</div>

			{/* Left-side phone mockup - CORRECT POSITION */}
			<div className="absolute left-[272px] top-[247px]">
				{/* Second border (offset) */}
				<div className="absolute left-[51px] top-[59px] w-[228px] h-[324px]">
					<Image
						src="/images/hero/border-frame.svg"
						alt=""
						width={228}
						height={324}
					/>
				</div>
				
				{/* First border */}
				<div className="absolute left-0 top-0 w-[228px] h-[324px]">
					<Image
						src="/images/hero/border-frame.svg"
						alt=""
						width={228}
						height={324}
					/>
				</div>

				{/* Phone image with mask */}
				<div 
					className="absolute left-[27px] top-[22px] w-[228px] h-[324px]"
					style={{
						maskImage: 'url(/images/hero/phone-mask.svg)',
						maskSize: '228px 324px',
						maskPosition: '0px 0px',
						maskRepeat: 'no-repeat',
						WebkitMaskImage: 'url(/images/hero/phone-mask.svg)',
						WebkitMaskSize: '228px 324px',
						WebkitMaskPosition: '0px 0px',
						WebkitMaskRepeat: 'no-repeat'
					}}
				>
					<Image
						src="/images/hero/f642bad26a2c8cdeea8853aee661d5425ee757fb.jpg"
						alt="Phone Mockup"
						width={344}
						height={344}
						className="object-cover"
					/>
				</div>
			</div>

			{/* Social icons vertical stack (right edge) */}
			<div 
				className="absolute flex flex-col gap-[24px] items-start justify-center right-[75px]"
				style={{ top: '50%', transform: 'translateY(-50%)' }}
			>
				<div className="w-[38px] h-[38px]">
					<Image
						src="/images/hero/social-icon-1.svg"
						alt="Social Icon 1"
						width={38}
						height={38}
					/>
				</div>
				<div className="w-[38px] h-[38px]">
					<Image
						src="/images/hero/social-icon-2.svg"
						alt="Social Icon 2"
						width={38}
						height={38}
					/>
				</div>
				<div className="w-[38px] h-[38px]">
					<Image
						src="/images/hero/social-icon-3.svg"
						alt="Social Icon 3"
						width={38}
						height={38}
					/>
				</div>
				<div className="w-[38px] h-[38px]">
					<Image
						src="/images/hero/social-icon-4.svg"
						alt="Social Icon 4"
						width={38}
						height={38}
					/>
				</div>
			</div>

			{/* Decorative dots pattern (left side) */}
			<div 
				className="absolute left-[75px] w-[107px] h-[125px]"
				style={{ top: 'calc(50% + 0.5px)', transform: 'translateY(-50%)' }}
			>
				<Image
					src="/images/hero/dots-decoration.svg"
					alt=""
					width={107}
					height={125}
				/>
			</div>

			{/* Secondary video (bottom-right, rotated) - hidden by default as per Figma opacity */}
			<div 
				className="absolute opacity-0 mix-blend-luminosity"
				style={{
					left: 'calc(50% + 790px)',
					top: '831.31px',
					transform: 'translateX(-50%) rotate(180deg) scaleY(-100%)',
					width: '116.813px',
					height: '97.366px'
				}}
			>
				<video
					ref={videoRef2}
					autoPlay
					loop
					muted
					playsInline
					className="w-full h-full object-cover"
					style={{
						maskImage: 'url(/images/hero/wireframe-mask.svg)',
						maskSize: '104px 86.686px',
						maskPosition: '6.414px 0px',
						maskRepeat: 'no-repeat'
					}}
				>
					<source src="/videos/ntx/ezgif-21e529558450e (1).mp4" type="video/mp4" />
				</video>
			</div>

			{/* Hidden text elements (opacity 0 in Figma design) */}
			<div className="absolute left-[calc(50%-14.812px)] top-[calc(50%-418.813px)] opacity-0">
				<p className="font-perfect-dark text-white uppercase text-[18.7px] leading-normal">
					LIFE IS BETTER
				</p>
				<p className="font-perfect-dark text-white uppercase text-[18.356px] leading-normal mt-2">
					WITH AI
				</p>
			</div>

			{/* Hidden bottom text sections (opacity 0 in Figma) */}
			<div className="absolute left-[76px] top-[1181px] opacity-0">
				<h3 className="font-azonix text-white uppercase text-[27.305px] leading-normal w-[321px]">
					Automation with AI
				</h3>
				<p className="text-[#95a1b4] text-[16px] leading-[1.5] w-[380px] mt-[70px]">
					Optimize processes and reduce costs with advanced AI technology.
				</p>
			</div>

			<div className="absolute left-[968px] top-[1299px] opacity-0">
				<h3 className="font-azonix text-white uppercase text-[27.305px] leading-normal">
					Chatbots and assistants AI
				</h3>
				<p className="text-[#95a1b4] text-[16px] leading-[1.5] w-[347px] mt-[117px]">
					Automate customer service with intelligent assistants.
				</p>
			</div>

			{/* Loading text (hidden) */}
			<p 
				className="absolute opacity-0 font-perfect-dark text-white uppercase text-[9.43px] leading-normal"
				style={{ left: 'calc(50% + 819px)', top: 'calc(50% + 445.266px)' }}
			>
				loading
			</p>
		</div>
	);
}

