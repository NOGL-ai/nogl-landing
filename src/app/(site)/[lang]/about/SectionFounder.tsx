import Heading from "@/shared/Heading";
import Image from "next/image";
import React from "react";

export interface People {
  id: string;
  name: string;
  job: string;
  avatar: string;
  bio: string;
}

const FOUNDER_DEMO: People[] = [
  {
    id: "1",
    name: `Emily Schomaker`,
    job: "Co-founder",
    avatar: "/images/about/Emily_Schomaker.JPG",
    bio: "With over a decade of experience in EdTech, Emily recognized the gap between expertise and accessibility. Her vision for Nogl stems from her belief that personalized learning can transform lives."
  },
  {
    id: "2",
    name: `Tuhin Mallick`,
    job: "Co-founder",
    avatar: "/images/about/Tuhin_Mallick.JPG",
    bio: "Tuhin brings extensive experience in building scalable platforms that connect people. His passion for democratizing access to knowledge drives Nogl's innovative approach to expert consultations."
  },
];

const SectionFounder = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-6 flex items-center justify-center gap-2">
            <span className="text-2xl">✨</span> Meet Our Team
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            United by a passion for democratizing access to expertise, our founders bring together years of experience in education technology and platform development to make expert knowledge accessible to everyone.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
          {FOUNDER_DEMO.map((person) => (
            <div 
              key={person.id} 
              className="flex flex-col items-center text-center group hover:transform hover:scale-105 transition-transform duration-300"
            >
              <div className="w-64 h-64 mb-6 overflow-hidden rounded-lg shadow-lg">
                <Image
                  src={person.avatar}
                  alt={person.name}
                  width={256}
                  height={256}
                  priority={person.id === "1"}
                  className="object-cover w-full h-full"
                />
              </div>
              <h3 className="text-2xl font-bold mb-2">{person.name}</h3>
              <p className="text-primary-600 dark:text-primary-400 font-medium mb-4">{person.job}</p>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {person.bio}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SectionFounder;
