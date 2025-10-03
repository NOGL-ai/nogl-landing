"use client";
import { Card, CardContent } from "@/components/ui/card";
import ShimmerButton from "@/components/ui/shimmer-button";
import Link from "next/link";
// import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import type { FC } from "react";
import type { Route } from "next";

interface CallToActionProps {
	dictionary: {
		callToAction: {
			title: string;
			description: string;
			buttonText: string;
			buttonUrl: string;
			testimonial: {
				heading: string;
				subheading: string;
				quote: string;
				author: string;
				role: string;
				waitlistButton: string;
			};
		};
	};
}

export default function HomeCallToAction({ dictionary }: CallToActionProps) {
	// Commented out Success Stories from Industry Leaders section to prevent performance issues
	return null;

	/* Original implementation commented out:
  if (!dictionary?.callToAction) {
    return null;
  }

  return (
    <section id="cta">
      <ContainerScroll
        titleComponent={
          <h2 className="text-2xl font-semibold text-black dark:text-white mb-6">
            {dictionary.callToAction.testimonial.heading} <br />
            <span className="text-3xl md:text-[3.5rem] font-bold mt-1 leading-none">
              {dictionary.callToAction.testimonial.subheading}
            </span>
          </h2>
        }
      >
        <Card className="mx-auto max-w-5xl">
          <div className="flex flex-col md:grid md:grid-cols-2 h-full">
            <div className="relative h-[200px] md:h-full">
              <img
                alt={`${dictionary.callToAction.testimonial.author} - ${dictionary.callToAction.testimonial.role}`}
                className="h-full w-full object-cover object-center object-[center_35%]"
                src="https://i.ibb.co/BBxkzfY/Viola-Weller-KWERLE-final-1-jpg.webp"
              />
            </div>
            <CardContent className="flex flex-col justify-center gap-y-2 xs:p-7 lsm:p-8 md:p-13 ">
              <blockquote className="text-balance text-sm md:text-lg lg:text-2xl font-semibold leading-tight">
                "{dictionary.callToAction.testimonial.quote}"
              </blockquote>
              <div className="py-1">
                <p className="font-semibold">{dictionary.callToAction.testimonial.author}</p>
                <p className="text-xs text-muted-foreground">
                  {dictionary.callToAction.testimonial.role}
                </p>
              </div>
              <Link href={dictionary.callToAction.buttonUrl as Route}>
                <ShimmerButton className="w-full text-white dark:text-white text-sm">
                  <span className="hidden lg:inline">{dictionary.callToAction.buttonText}</span>
                  <span className="lg:hidden">{dictionary.callToAction.testimonial.waitlistButton}</span> →
                </ShimmerButton>
              </Link>
            </CardContent>
          </div>
        </Card>
      </ContainerScroll>
    </section>
  );
  */
}
