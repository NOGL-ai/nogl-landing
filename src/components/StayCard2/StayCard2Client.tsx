// src/components/StayCard2/StayCard2Client.tsx
"use client";

import React, { FC, useState } from "react";
import GallerySlider from "@/components/GallerySlider";
import StartRating from "@/components/StartRating";
import BtnLikeIcon from "@/components/BtnLikeIcon";
import SaleOffBadge from "@/components/SaleOffBadge";

interface StayCard2ClientProps {
    id: string;
    galleryImgs: string[];
    saleOff?: string;
    duration: number;
    ratings?: number;
    reviewCount?: number;
}

const StayCard2Client: FC<StayCard2ClientProps> = ({
    id,
    galleryImgs,
    saleOff,
    duration,
    ratings,
    reviewCount,
}) => {
    const [like, setLike] = useState(false);

    return (
        <div className='relative w-full' onClick={(e) => e.stopPropagation()}>
            <GallerySlider
                uniqueID={`StayCard2_${id}`}
                ratioClass='aspect-w-12 aspect-h-11'
                galleryImgs={galleryImgs}
                imageClass='rounded-lg'
            />
            <BtnLikeIcon 
                isLiked={like} 
                className='absolute right-3 top-3 z-[1]'
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setLike(!like);
                }}
            />
            {saleOff && (
                <SaleOffBadge 
                    className='absolute left-3 top-3 text-xs lg:text-sm' 
                    desc={saleOff} 
                />
            )}
            <SaleOffBadge
                className='absolute left-3 bottom-3 flex items-center bg-blue-700 text-blue-50 text-xs lg:text-sm'
                desc={
                    <div className="flex items-center">
                        <i className="las la-hourglass-half text-xs lg:text-sm"></i>
                        <span className="ml-1">{duration} hrs</span>
                    </div>
                }
            />
            {!!ratings && (
                <div className='absolute bottom-3 right-3 z-[1] bg-black bg-opacity-75 p-1 rounded-lg text-white text-xs lg:text-sm'>
                    <StartRating reviewCount={reviewCount} rating={ratings} />
                </div>
            )}
        </div>
    );
};

export default StayCard2Client;