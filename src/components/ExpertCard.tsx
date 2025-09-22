import React, { FC } from "react";
import GallerySlider from "@/components/GallerySlider";
import { ExpertDataType } from "@/data/types"; // Change the data type to ExpertDataType
import BtnLikeIcon from "@/components/BtnLikeIcon";
import Badge from "@/shared/Badge";
import Link from "next/link";
import ButtonPrimary from "@/shared/ButtonPrimary";

export interface ExpertCardProps {
  className?: string;
  data?: ExpertDataType; // Change the data type to ExpertDataType
  size?: "default" | "small";
}

const ExpertCard: FC<ExpertCardProps> = ({
  size = "default",
  className = "",
  data,
}) => {
  if (!data) {
    return null; // Return null if no data
  }

  const {
    galleryImgs,
    title,
    href,
    like,
    id,
    authorName, // Expert's name
    hostBio, // Short bio
    tags = [], // Tags or areas of expertise
  } = data;

  const renderSliderGallery = () => {
    return (
      <div className="relative w-full">
        <GallerySlider
          uniqueID={`ExpertCard_${id}`}
          ratioClass="aspect-w-12 aspect-h-11"
          galleryImgs={galleryImgs}
          imageClass="rounded-lg"
          href={href}
        />
        <BtnLikeIcon isLiked={like} className="absolute right-3 top-3 z-[1]" />
      </div>
    );
  };

  const renderContent = () => {
    return (
      <div className={`mt-3 space-y-4`}>
        {/* Expert's Name as Centered Heading */}
        <div className="text-center">
          <h2
            className={`font-bold text-neutral-900 dark:text-white text-xl mb-1`}
          >
            {authorName ? authorName : "Unknown Author"}
          </h2>

          {/* Expert's Bio */}
          <div className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
            {hostBio ? hostBio : "Expert in relevant field"}
          </div>
        </div>

        {/* Tags or Areas of Expertise */}
        <div className="flex justify-center flex-wrap gap-2 mt-3">
          {tags.slice(0, 3).map((tag, index) => (
            <Badge
              key={index}
              name={tag}
              className="px-3 py-1 rounded-full text-sm bg-gray-200 text-gray-600"
            />
          ))}
        </div>

        <div className="border-b border-neutral-100 dark:border-neutral-800 my-4"></div>

        {/* Centered Green Button */}
        <div className="flex justify-center">
          <ButtonPrimary
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white"
            children="View Profile"
          />
        </div>
      </div>
    );
  };

  return (
    <div className={`nc-ExpertCard group relative ${className}`}>
      {renderSliderGallery()}
      <Link href={href}>{renderContent()}</Link>
    </div>
  );
};

export default ExpertCard;
