"use client";
import { FC, useEffect, useState } from "react";
import { Route } from 'next';
import { useSession } from "next-auth/react";
import { useSessionStore } from "../store";
import Avatar from "@/shared/Avatar";
import Badge from "@/shared/Badge";
import ButtonPrimary from "@/shared/ButtonPrimary";
import ButtonSecondary from "@/shared/ButtonSecondary";
import ButtonClose from "@/shared/ButtonClose";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { getSignedURLForGallery } from "@/actions/upload";
import { FaGift } from "react-icons/fa";
import DOMPurify from 'dompurify';

export interface PageAddListing5Props {}

const DEFAULT_AVATAR = '/images/dashboard/profile-avatar.png';

const PageAddListing5: FC<PageAddListing5Props> = () => {
  const { data: session } = useSession();
  const { sessionData, localGalleryFiles } = useSessionStore();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  const handlePublish = async () => {
    // Validate all required fields
    if (
      !sessionData.sessionTitle ||
      !sessionData.sessionCategory ||
      !sessionData.sessionDate ||
      !sessionData.startTime ||
      !sessionData.description ||
      !localGalleryFiles.length
    ) {
      toast.error("Please complete all required fields before publishing");
      return;
    }

    try {
      const uploadedImageKeys: string[] = [];

      for (let i = 0; i < localGalleryFiles.length; i++) {
        const file = localGalleryFiles[i];
        const signedUrlResponse = await getSignedURLForGallery(file.type, file.size, i);

        if (signedUrlResponse.failure !== undefined) {
          toast.error(signedUrlResponse.failure);
          return;
        }

        const { url, key } = signedUrlResponse.success!;

        const uploadResponse = await fetch(url, {
          method: "PUT",
          headers: {
            "Content-Type": file.type || "application/octet-stream",
          },
          body: file,
        });

        if (!uploadResponse.ok) {
          toast.error(`Failed to upload image ${i + 1}`);
          return;
        }

        uploadedImageKeys.push(key);
      }

      // Prepare the data to send to the server
      const sessionPayload = {
        sessionTitle: sessionData.sessionTitle,
        sessionCategory: sessionData.sessionCategory,
        expertiseLevel: sessionData.expertiseLevel,
        sessionType: sessionData.sessionType,
        minParticipants: Number(sessionData.minParticipants),
        maxParticipants: Number(sessionData.maxParticipants),
        sessionDate: new Date(sessionData.sessionDate).toISOString(),
        startTime: new Date(sessionData.startTime).toISOString(),
        timeZone: sessionData.timeZone,
        duration: Number(sessionData.duration),
        basePrice: Number(sessionData.basePrice),
        description: sessionData.description,
        tags: sessionData.tags || [],
        galleryImages: uploadedImageKeys,
      };

      console.log('Session Payload:', sessionPayload);

      // Make the POST request to create the session
      const response = await fetch('/api/sessions/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create session');
      }

      toast.success("Session published successfully!");
      useSessionStore.getState().resetSession();
      router.push("/");
    } catch (error) {
      console.error("Error publishing session:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to publish session. Please try again."
      );
    }
  };

  // Render functions for different sections
  const renderHeader = () => {
    return (
      <header className="rounded-md sm:rounded-xl">
        <div className="relative grid grid-cols-3 gap-1 sm:grid-cols-4 sm:gap-2">
          <div className="relative col-span-2 row-span-3 sm:row-span-2">
            <div className="relative w-full h-0 pb-[75%]">
              <Image
                src={session?.user?.image || DEFAULT_AVATAR}
                alt="Session Host"
                fill
                sizes="(max-width: 768px) 66vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover rounded-md sm:rounded-xl"
                priority
              />
            </div>
          </div>
          {sessionData.galleryImages?.slice(0, 4).map((item: string, index: number) => (
            <div
              key={index}
              className={`relative ${index >= 2 ? "hidden sm:block" : ""}`}
            >
              <div className="relative w-full h-0 pb-[75%]">
                <Image
                  fill
                  sizes="(max-width: 640px) 33vw, 25vw"
                  className="object-cover rounded-md sm:rounded-xl"
                  src={item}
                  alt={`Gallery Image ${index + 1}`}
                  priority={index < 2}
                />
              </div>
            </div>
          ))}
        </div>
      </header>
    );
  };

  const renderSection1 = () => {
    return (
      <div className="listingSection__wrap space-y-6">
        {/* Badges */}
        <div className="flex flex-wrap items-center space-x-2">
          {/* Category Badge - Purple */}
          {sessionData.sessionCategory && (
            <Badge 
              name={sessionData.sessionCategory} 
              color="purple"
            />
          )}
          
          {/* Circle Badge - Green */}
          {sessionData.isCircleCommunity && (
            <Badge 
              name="Circle" 
              color="green" 
            />
          )}
          
          {/* Tags Badges - Blue */}
          {sessionData.tags?.map((tag, index) => (
            <Badge 
              key={index} 
              name={tag} 
              color="blue"
            />
          ))}
        </div>

        {/* Title */}
        <h1 className="text-2xl font-semibold sm:text-3xl lg:text-4xl">
          {sessionData.sessionTitle}
        </h1>

        {/* Instructor Info */}
        <div className="flex items-center mt-4">
          <Avatar
            hasChecked
            sizeClass="h-10 w-10"
            radius="rounded-full"
            imgUrl={session?.user?.image || DEFAULT_AVATAR}
            sizes="40px"
          />
          <span className="ml-2.5 text-neutral-500 dark:text-neutral-400">
            Led by{" "}
            <span className="font-medium text-neutral-900 dark:text-neutral-200">
              {session?.user?.name || "Instructor Name"}
            </span>
          </span>
        </div>

        {/* Divider */}
        <hr className="border-neutral-200 dark:border-neutral-700" />

        {/* Session Details */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-4 mt-4 text-sm text-neutral-700 dark:text-neutral-300 sm:grid-cols-2 sm:gap-y-6">
          <div className="flex items-center space-x-2">
            <i className="las la-users text-xl"></i>
            <span>
              Participants: {sessionData.minParticipants} -{" "}
              {sessionData.maxParticipants}
            </span>
          </div>
          {sessionData.duration && (
            <div className="flex items-center space-x-2">
              <i className="las la-clock text-xl"></i>
              <span>Duration: {sessionData.duration} hours</span>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <i className="las la-signal text-xl"></i>
            <span>Level: {sessionData.expertiseLevel}</span>
          </div>
          <div className="flex items-center space-x-2">
            <i className="las la-chalkboard-teacher text-xl"></i>
            <span>Type: {sessionData.sessionType}</span>
          </div>
          <div className="flex items-center space-x-2">
            <i className="las la-euro-sign text-xl"></i>
            <span>Base Price: €{sessionData.basePrice}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderSection2 = () => {
    return (
      <div className="listingSection__wrap">
        <h2 className="text-2xl font-semibold">Session Information</h2>
        <div className="w-14 border-b border-neutral-200 dark:border-neutral-700"></div>
        <div 
          className="text-neutral-600 dark:text-neutral-300 mt-4 prose dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ 
            __html: DOMPurify.sanitize(sessionData.description || '') 
          }}
        />
      </div>
    );
  };

  const renderSection3 = () => {
    // Skip rendering on small screens if no benefits
    const hasAdditionalBenefits = false; // You can make this dynamic based on your data
    
    if (!hasAdditionalBenefits) {
      return (
        <div className="listingSection__wrap hidden sm:block">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold flex items-center space-x-2">
                <span>Additional Benefits</span>
                <span className="px-2 py-1 text-xs bg-neutral-200 dark:bg-neutral-700 rounded-full">
                  Coming Soon
                </span>
              </h2>
              <span className="mt-2 block text-neutral-500 dark:text-neutral-400">
                What this session offers
              </span>
            </div>
          </div>
          <div className="w-14 border-b border-neutral-200 dark:border-neutral-700"></div>

          {/* Enhanced message with icon and better styling */}
          <div className="mt-8 flex items-center justify-center p-6 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
            <div className="flex flex-col items-center space-y-3">
              <FaGift className="w-8 h-8 text-neutral-400 dark:text-neutral-500" />
              <span className="text-center text-neutral-600 dark:text-neutral-300 font-medium">
                Platform benefits will be provided only
              </span>
            </div>
          </div>
        </div>
      );
    }

    // Return the full benefits section when there are benefits to show
    return (
      <div className="listingSection__wrap">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold flex items-center space-x-2">
              <span>Additional Benefits</span>
              <span className="px-2 py-1 text-xs bg-neutral-200 dark:bg-neutral-700 rounded-full">
                Coming Soon
              </span>
            </h2>
            <span className="mt-2 block text-neutral-500 dark:text-neutral-400">
              What this session offers
            </span>
          </div>
        </div>
        <div className="w-14 border-b border-neutral-200 dark:border-neutral-700"></div>

        {/* Enhanced message with icon and better styling */}
        <div className="mt-8 flex items-center justify-center p-6 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
          <div className="flex flex-col items-center space-y-3">
            <FaGift className="w-8 h-8 text-neutral-400 dark:text-neutral-500" />
            <span className="text-center text-neutral-600 dark:text-neutral-300 font-medium">
              Platform benefits will be provided only
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="nc-PageAddListing5">
      {/* Preview Header */}
      {/* <div className="relative">
        <h2 className="text-2xl font-semibold mb-8">Session Preview</h2>
        <ButtonPrimary className="absolute right-0 top-0" onClick={handlePublish}>
          Publish Session
        </ButtonPrimary>
      </div> */}

      {/* MAIN */}
      <main className="relative z-10 mt-11">
        {/* CONTENT */}
        <div className="w-full space-y-8">
          {renderHeader()}
          {renderSection1()}
          {renderSection2()}
          {renderSection3()}
          <div className="flex items-center space-x-5 mt-8">
            <ButtonSecondary href={"/add-session/1" as Route}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
              <span className="ml-3">Edit</span>
            </ButtonSecondary>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PageAddListing5;