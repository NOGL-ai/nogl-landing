"use client";

import React, {
  forwardRef,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import * as Accordion from "@radix-ui/react-accordion";
import { motion, useInView } from "framer-motion";
import Image from "next/image";

// Utility function for class names
const cn = (...classes: any[]) => classes.filter(Boolean).join(" ");

// AccordionItem Component
const AccordionItem = forwardRef<any, any>(
  ({ children, className, value, ...props }, forwardedRef) => (
    <Accordion.Item
      value={value || "item"}
      className={cn(
        "mt-px overflow-hidden focus-within:relative focus-within:z-10",
        className
      )}
      {...props}
      ref={forwardedRef}
    >
      {children}
    </Accordion.Item>
  )
);

// AccordionTrigger Component
const AccordionTrigger = forwardRef<any, any>(
  ({ children, className, ...props }, forwardedRef) => (
    <Accordion.Header className="flex">
      <Accordion.Trigger
        className={cn(
          "group flex h-[45px] flex-1 cursor-pointer items-center justify-between px-5 text-[15px] leading-none outline-none",
          className
        )}
        {...props}
        ref={forwardedRef}
      >
        {children}
      </Accordion.Trigger>
    </Accordion.Header>
  )
);

// AccordionContent Component
const AccordionContent = forwardRef<any, any>(
  ({ children, className, ...props }, forwardedRef) => (
    <Accordion.Content
      className={cn(
        "overflow-hidden text-[15px] font-medium data-[state=closed]:animate-slide-up data-[state=open]:animate-slide-down",
        className
      )}
      {...props}
      ref={forwardedRef}
    >
      <div className="px-5 py-2">{children}</div>
    </Accordion.Content>
  )
);

// Data for the Feature Section
const cardData = [
  {
    id: 1,
    title: "Direct Access to Industry Experts",
    content: "Gain valuable insights from professionals in your field through our platform.",
    image: "https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg",
  },
  {
    id: 2,
    title: "Interactive Sessions",
    content: "Participate in engaging, real-time discussions to enhance your learning experience.",
    image: "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg",
  },
  {
    id: 3,
    title: "Valuable Insights",
    content: "Access a wealth of knowledge designed to help you grow and succeed in your career.",
    image: "https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg",
  },
  {
    id: 4,
    title: "Affordable Options",
    content: "Get the most out of each session with cost-effective learning solutions.",
    image: "https://images.pexels.com/photos/3943716/pexels-photo-3943716.jpeg",
  },
];

// Feature Component
const Feature = ({
  collapseDelay = 5000,
  ltr = false,
  linePosition = "left",
}) => {
  const [currentIndex, setCurrentIndex] = useState(-1);
  const carouselRef = useRef<HTMLUListElement>(null);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, {
    once: true,
    amount: 0.5,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isInView) {
        setCurrentIndex(0);
      } else {
        setCurrentIndex(-1);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isInView]);

  const scrollToIndex = (index: number) => {
    if (carouselRef.current) {
      const cards = (carouselRef.current as HTMLElement).querySelectorAll(".card");
      const card = cards[index] as HTMLElement;
      if (card) {
        const cardRect = card.getBoundingClientRect();
        const carouselRect = (carouselRef.current as HTMLElement).getBoundingClientRect();
        const offset =
          cardRect.left -
          carouselRect.left -
          (carouselRect.width - cardRect.width) / 2;

        (carouselRef.current as HTMLElement).scrollTo({
          left: (carouselRef.current as HTMLElement).scrollLeft + offset,
          behavior: "smooth",
        });
      }
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex !== undefined ? (prevIndex + 1) % cardData.length : 0
      );
    }, collapseDelay);

    return () => clearInterval(timer);
  }, [currentIndex, collapseDelay]);

  useEffect(() => {
    const handleAutoScroll = () => {
      const nextIndex =
        (currentIndex !== undefined ? currentIndex + 1 : 0) % cardData.length;
      scrollToIndex(nextIndex);
    };

    const autoScrollTimer = setInterval(handleAutoScroll, collapseDelay);

    return () => clearInterval(autoScrollTimer);
  }, [currentIndex, collapseDelay]);

  useEffect(() => {
    const carousel = carouselRef.current;
    if (carousel) {
      const handleScroll = () => {
        const scrollLeft = carousel.scrollLeft;
        const cardWidth = (carousel.querySelector(".card") as HTMLElement)?.clientWidth || 0;
        const newIndex = Math.min(
          Math.floor(scrollLeft / cardWidth),
          cardData.length - 1
        );
        setCurrentIndex(newIndex);
      };

      carousel.addEventListener("scroll", handleScroll);
      return () => carousel.removeEventListener("scroll", handleScroll);
    }
  }, []);

  return (
    <section ref={ref} id="features">
      <div className="py-14">
        <div className="container flex w-full flex-col items-center justify-center p-4">
          <div className="mx-auto max-w-5xl text-center">
            <h4 className="text-xl font-bold tracking-tight text-black dark:text-white">
            Enhance Your Learning Experience with Expert Interactions
            </h4>
            <h2 className="text-4xl font-bold tracking-tight text-black dark:text-white sm:text-6xl">
            </h2>
          </div>
          <div className="mx-auto my-12 grid h-full max-w-5xl grid-cols-5 gap-x-10">
            <div
              className={`col-span-2 hidden md:flex ${
                ltr ? "md:order-2 md:justify-end" : "justify-start"
              }`}
            >
              <Accordion.Root
                className="w-[300px]"
                type="single"
                defaultValue={`item-${currentIndex}`}
                value={`item-${currentIndex}`}
                onValueChange={(value) =>
                  setCurrentIndex(Number(value.split("-")[1]))
                }
              >
                {cardData.map((item, index) => (
                  <AccordionItem
                    key={item.id}
                    className="relative mb-8 last:mb-0"
                    value={`item-${index}`}
                  >
                    <div
                      className={`absolute bottom-0 top-0 h-full w-0.5 overflow-hidden rounded-lg bg-neutral-300/50 dark:bg-neutral-300/30 ${
                        linePosition === "right"
                          ? "left-auto right-0"
                          : "left-0 right-auto"
                      }`}
                    >
                      <div
                        className={`absolute left-0 top-0 w-full ${
                          currentIndex === index ? "h-full" : "h-0"
                        } origin-top bg-neutral-500 transition-all ease-linear dark:bg-white`}
                        style={{
                          transitionDuration:
                            currentIndex === index
                              ? `${collapseDelay}ms`
                              : "0s",
                        }}
                      ></div>
                    </div>
                    <AccordionTrigger className="text-xl font-bold">
                      {item.title}
                    </AccordionTrigger>
                    <AccordionContent>{item.content}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion.Root>
            </div>
            <div
              className={`col-span-5 h-[350px] min-h-[200px] w-auto md:col-span-3 ${
                ltr && "md:order-1"
              }`}
            >
              {cardData[currentIndex]?.image ? (
                <motion.img
                  key={currentIndex}
                  src={cardData[currentIndex].image}
                  alt="feature"
                  className="aspect-auto h-full w-full rounded-xl border border-neutral-300/50 object-cover p-1"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                />
              ) : (
                <div className="aspect-auto h-full w-full rounded-xl border border-neutral-300/50 bg-gray-200 p-1"></div>
              )}
            </div>

            <ul
              ref={carouselRef}
              className="col-span-5 flex h-full snap-x flex-nowrap overflow-x-auto py-10 [-ms-overflow-style:none] [-webkit-mask-image:linear-gradient(90deg,transparent,black_20%,white_80%,transparent)] [mask-image:linear-gradient(90deg,transparent,black_20%,white_80%,transparent)] [scrollbar-width:none] md:hidden [&::-webkit-scrollbar]:hidden snap-mandatory"
              style={{
                padding: "50px calc(50%)",
              }}
            >
              {cardData.map((item, index) => (
                <a
                  key={item.id}
                  className="card relative mr-8 grid h-full max-w-60 shrink-0 items-start justify-center py-4 last:mr-0"
                  onClick={() => setCurrentIndex(index)}
                  style={{
                    scrollSnapAlign: "center",
                  }}
                >
                  <div className="absolute bottom-0 left-0 right-auto top-0 h-0.5 w-full overflow-hidden rounded-lg bg-neutral-300/50 dark:bg-neutral-300/30">
                    <div
                      className={`absolute left-0 top-0 h-full ${
                        currentIndex === index ? "w-full" : "w-0"
                      } origin-top bg-neutral-500 transition-all ease-linear dark:bg-white`}
                      style={{
                        transitionDuration:
                          currentIndex === index ? `${collapseDelay}ms` : "0s",
                      }}
                    ></div>
                  </div>
                  <h2 className="text-xl font-bold">{item.title}</h2>
                  <p className="mx-0 max-w-sm text-balance text-sm">
                    {item.content}
                  </p>
                </a>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

// Export FeatureSection as default export
export default function FeatureSection() {
  return <Feature collapseDelay={5000} linePosition="left" />;
}
