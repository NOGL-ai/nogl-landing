"use client";
import React, { FC, useState, useEffect } from "react";
import ButtonPrimary from "@/shared/ButtonPrimary";
import ButtonSecondary from "@/shared/ButtonSecondary";
import { Route } from "@/routers/types";
import { useSessionStore } from "../store";
import toast, { Toaster } from "react-hot-toast";
import { FiAlertCircle } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { getSignedURLForGallery } from "@/actions/upload";
// import { encodeId } from "@/utils/hashId";  // Comment this out
import { validateStep, VALIDATION_MESSAGES, TOAST_STYLES } from '../validation';
import { showErrorToast, showSuccessToast, showLoadingToast } from '../validation';

export interface CommonLayoutProps {
  children: React.ReactNode;
  params: {
    stepIndex: string;
  };
  title: string;
  subtitle: string;
}

// Add temporary local encode function
const localEncodeId = (id: string): string => {
  // For testing, just return the ID as-is
  return id;
};

const CommonLayout: FC<CommonLayoutProps> = ({
  children,
  params,
  title,
  subtitle,
}) => {
  const [isPublishing, setIsPublishing] = useState(false);
  const { sessionData, localGalleryFiles, resetSession, clearValidationErrors } = useSessionStore();
  const [selectedCoverIndex, setSelectedCoverIndex] = useState<number>(0);
  const index = Number(params.stepIndex) || 1;
  const nextHref = (index < 5
    ? `/add-session/${index + 1}`
    : undefined) as Route;
  const backHref = (index > 1
    ? `/add-session/${index - 1}`
    : `/add-session/1`) as Route;
  const nextBtnText = index === 5 ? "Publish session" : "Continue";
  const progress = (index / 5) * 100;
  const router = useRouter();

  // Add useEffect to clear error toasts and validation errors when step changes
  useEffect(() => {
    // Dismiss all error toasts when step changes
    toast.dismiss();
    // Clear validation errors
    clearValidationErrors();
  }, [index, clearValidationErrors]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[Navigation] Current step:", index);

    // Dismiss any existing error toasts before validation
    toast.dismiss();

    // Validate current step before proceeding
    const error = validateStep(index, sessionData);
    if (error) {
      showErrorToast(error, `validation-error-${index}`);
      return;
    }

    // If not on the final step, navigate to next step
    if (index < 5) {
      console.log("[Navigation] Proceeding to:", nextHref);
      router.push(nextHref);
      return;
    }

    // Publishing logic for final step
    if (index === 5) {
      try {
        setIsPublishing(true);

        // Use centralized validation message
        if (!localGalleryFiles || localGalleryFiles.length < 1) {
          showErrorToast(VALIDATION_MESSAGES.images.min, 'validation-error-images');
          setIsPublishing(false);
          return;
        }

        showLoadingToast(VALIDATION_MESSAGES.session.publishing, 'publishing-status');
        const uploadedImageKeys: string[] = [];
        
        // Iterate over localGalleryFiles to upload each file
        for (let i = 0; i < localGalleryFiles.length; i++) {
          const file = localGalleryFiles[i];
          console.log(`Processing file ${i + 1}:`, {
            name: file.name,
            type: file.type,
            size: file.size,
          });

          // Get a signed URL for uploading
          const signedUrlResponse = await getSignedURLForGallery(
            file.type,
            file.size,
            i
          );

          console.log(`Signed URL response for file ${i +   1}:`, signedUrlResponse);

          if (signedUrlResponse.failure) {
            showErrorToast(signedUrlResponse.failure, 'upload-error-' + i);
            setIsPublishing(false);
            return;
          }

          const { url, key } = signedUrlResponse.success!;

          // Upload the file to the server
          const uploadResponse = await fetch(url, {
            method: "PUT",
            headers: {
              "Content-Type": file.type,
            },
            body: file,
          });

          if (!uploadResponse.ok) {
            showErrorToast(VALIDATION_MESSAGES.upload.failed(i), 'upload-error-' + i);
            setIsPublishing(false);
            return;
          }

          uploadedImageKeys.push(key); // Store the uploaded image key
        }

        console.log("Uploaded images:", uploadedImageKeys);

        // Construct the session payload for submission
        const sessionPayload = {
          ...sessionData,
          galleryImages: uploadedImageKeys,
          coverImage: uploadedImageKeys[selectedCoverIndex] || uploadedImageKeys[0], // Use selectedCoverIndex for the cover image
        };


        console.log("Session payload:", sessionPayload);

        console.log("Sending payload to API:", sessionPayload);
        
        const response = await fetch("/api/sessions/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(sessionPayload),
        });

        const responseData = await response.json();
        console.log("API Response after session creation:", responseData);

        if (!response.ok) {
          throw new Error(responseData.error || VALIDATION_MESSAGES.session.creation.failed);
        }

        // Extract the session ID from the response
        const sessionId = responseData.session?.id;
        
        if (!sessionId) {
          console.error("No session ID in response:", responseData);
          throw new Error("Failed to get session ID");
        }

        // Encode the UUID to hashid
        // const hashedId = await encodeId(sessionId);
        const hashedId = localEncodeId(sessionId);

        // Only dismiss success and loading toasts
        const currentToasts = document.querySelectorAll('[role="status"]');
        currentToasts.forEach(toast => {
          if (toast.textContent?.includes('success') || toast.textContent?.includes('loading')) {
            toast.remove();
          }
        });
        showSuccessToast(VALIDATION_MESSAGES.session.creation.success, 'publish-success');

        // Wait a brief moment for the success message
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Prevent any state updates by immediately redirecting
        const redirectUrl = `/listing-session-detail/${hashedId}`;
        
        // Disable any state updates or re-renders
        e.preventDefault();
        e.stopPropagation();
        
        // Immediate redirect
        window.location.replace(redirectUrl);
        
        // Return early to prevent any further state updates
        return;
        
      } catch (error) {
        console.error("Error during publish:", error);
        toast.dismiss();
        showErrorToast(
          error instanceof Error ? error.message : "Failed to publish session",
          'publish-error'
        );
      } finally {
        setIsPublishing(false);
      }
    }
  };

  return (
    <div className="nc-PageAddListing1 px-4 max-w-3xl mx-auto pb-24 pt-14 sm:py-24 lg:pb-32">
      <Toaster />

      <form 
        onSubmit={(e) => {
          console.log("Form onSubmit triggered");
          handleSubmit(e);
        }}
      >
        <div className="space-y-11">
          {/* Step Progress */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-3xl font-semibold text-primary-600">
                  {index}
                </span>
                <span className="text-lg text-neutral-500 dark:text-neutral-400">
                  / 5
                </span>
              </div>
              <span className="text-sm text-neutral-500">
                {Math.round(progress)}% Complete
              </span>
            </div>
            <div className="w-full h-2 bg-neutral-200 rounded-full dark:bg-neutral-700">
              <div
                className="h-2 bg-primary-600 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Title and Subtitle */}
          <div>
            <h2 className="text-2xl font-semibold">{title}</h2>
            {subtitle && (
              <p className="text-lg text-neutral-500 dark:text-neutral-400">
                {subtitle}
              </p>
            )}
          </div>

          {/* Children Content */}
          <div className="listingSection__wrap">{children}</div>

          {/* Navigation Buttons */}
          <div className="flex justify-end space-x-5">
            <ButtonSecondary 
              href={backHref}
              onClick={() => {
                toast.dismiss();  // Dismiss all toasts when going back
                clearValidationErrors();  // Clear validation errors when going back
              }}
            >
              Go back
            </ButtonSecondary>
            <ButtonPrimary 
              type="submit"
              disabled={isPublishing}
              onClick={() => console.log("Publish button clicked")}
              className={`relative ${isPublishing ? "cursor-not-allowed opacity-70" : ""}`}
            >
              {isPublishing ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Publishing...
                </span>
              ) : (
                nextBtnText
              )}
            </ButtonPrimary>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CommonLayout;
