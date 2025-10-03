import React from "react";
import Particles from "@/components/ui/particles";
import { GlassmorphismBackground } from "@/components/atoms";
import { cn } from "@/lib/utils";

export interface GlassParticlePageProps {
	className?: string;
	children: React.ReactNode;
	// Allow overriding particle settings when needed
	particlesProps?: Partial<{
		className: string;
		quantity: number;
		staticity: number;
		ease: number;
		size: number;
		color: string;
	}>;
}

// Reusable page wrapper that replicates the landing page background
// (particles + subtle glassmorphism blobs) and places content above it.
export default function GlassParticlePage({
	className,
	children,
	particlesProps,
}: GlassParticlePageProps) {
	const {
		className: particlesClassName = "absolute inset-0 -z-10",
		quantity = 5000,
		ease = 70,
		size = 0.5,
		staticity = 40,
		color = "#4F46E5",
	} = particlesProps || {};

	return (
		<div className={cn("relative overflow-hidden", className)}>
			<Particles
				className={particlesClassName}
				quantity={quantity}
				ease={ease}
				size={size}
				staticity={staticity}
				color={color}
			/>
			<GlassmorphismBackground />

			{/* Content layer */}
			<div className='relative z-10'>{children}</div>
		</div>
	);
}
