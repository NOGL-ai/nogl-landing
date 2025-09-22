"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import FormItem from "../FormItem";
import Card from "@/components/Common/Dashboard/Card";
import { FaImages, FaTrash, FaImage } from "react-icons/fa";
import Loader from "@/components/Common/Loader";
import { useSessionStore } from "../store";
import {
  VALIDATION_MESSAGES,
  TOAST_STYLES,
  showErrorToast,
  showSuccessToast,
  showLoadingToast,
} from "../validation";
import { getSignedURL } from "@/actions/upload";
import toast from "react-hot-toast";

export default function PageAddListing4() {
  const { data: session, status, update } = useSession();
  const {
    sessionData,
    updateSession,
    localGalleryFiles,
    setLocalGalleryFiles,
    validationErrors,
    updateValidationErrors,
    clearValidationErrors,
  } = useSessionStore();

  const [selectedCoverIndex, setSelectedCoverIndex] = useState<number>(() => {
    const index = sessionData.galleryImages.findIndex(
      (url) => url === sessionData.coverImage
    );
    return index !== -1 ? index : 0; // Default to 0 if no match is found
  });

  // Profile picture states
  const [uploading, setUploading] = useState(false);
  const [profileFile, setProfileFile] = useState<File>();
  const [previewUrl, setPreviewUrl] = useState<string>(session?.user?.image || "");

  useEffect(() => {
    if (status === "unauthenticated") {
      window.location.href = "/auth/signin";
      return;
    }

    // Logging on mount
    console.log("[Page4] Mounted with gallery state:", {
      galleryImages: sessionData.galleryImages,
      localFiles: localGalleryFiles,
      coverImage: sessionData.coverImage,
      selectedIndex: selectedCoverIndex,
    });

    return () => {
      // Logging before unmount
      console.log("[Page4] Unmounting with gallery state:", {
        galleryImages: sessionData.galleryImages,
        localFiles: localGalleryFiles,
        coverImage: sessionData.coverImage,
        selectedIndex: selectedCoverIndex,
      });
    };
  }, [status, sessionData, localGalleryFiles, selectedCoverIndex]);

  if (status === "unauthenticated") {
    // Prevent rendering while redirecting
    return null;
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) {
      console.log("[Image Upload] No files selected");
      return;
    }

    console.log(
      `[Image Upload] Current gallery size: ${
        sessionData.galleryImages?.length || 0
      }`
    );
    console.log(`[Image Upload] Attempting to upload ${files.length} new files`);

    if ((sessionData.galleryImages?.length || 0) + files.length > 5) {
      console.log(
        "[Image Upload] Validation Failed: Maximum images limit exceeded"
      );
      updateValidationErrors({
        images: VALIDATION_MESSAGES.images.max,
      });
      toast.error(VALIDATION_MESSAGES.images.max, {
        ...TOAST_STYLES.error,
        id: "validation-error-4",
      });
      return;
    }

    let hasValidImages = false;
    const newUrls: string[] = [];
    const newFiles: File[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      console.log(`[Image Upload] Processing file ${i + 1}:`, {
        name: file.name,
        type: file.type,
        size: `${(file.size / (1024 * 1024)).toFixed(2)}MB`,
      });

      if (
        !["image/png", "image/jpeg", "image/jpg"].includes(file.type) ||
        file.size > 2 * 1024 * 1024
      ) {
        console.log(`[Image Upload] File ${file.name} validation failed:`, {
          validType: ["image/png", "image/jpeg", "image/jpg"].includes(
            file.type
          ),
          validSize: file.size <= 2 * 1024 * 1024,
        });
        continue;
      }

      try {
        const base64 = await convertToBase64(file);
        newUrls.push(base64);
        newFiles.push(file);
        hasValidImages = true;
        console.log(`[Image Upload] Successfully processed ${file.name}`);
      } catch (conversionError) {
        console.error(
          `[Image Upload] Error converting ${file.name}:`,
          conversionError
        );
      }
    }

    if (!hasValidImages) {
      console.log("[Image Upload] No valid images found after processing");
      updateValidationErrors({
        images: VALIDATION_MESSAGES.images.noValid,
      });
      toast.error(VALIDATION_MESSAGES.images.noValid, {
        duration: Infinity,
        style: {
          background: "#FEF2F2",
          color: "#991B1B",
          borderColor: "#F87171",
        },
      });
      return;
    }

    console.log("[Image Upload] Final validation passed:", {
      validImagesCount: newUrls.length,
      totalGallerySize:
        (sessionData.galleryImages?.length || 0) + newUrls.length,
    });

    const currentGalleryImages = sessionData.galleryImages || [];
    const updatedGalleryImages = [...currentGalleryImages, ...newUrls];

    const updatedGalleryFiles = [...localGalleryFiles, ...newFiles];

    setLocalGalleryFiles(updatedGalleryFiles); // Update local galleryFiles state

    let updatedCoverImage = sessionData.coverImage;

    if (
      selectedCoverIndex < 0 || // Invalid selected index
      selectedCoverIndex >= updatedGalleryImages.length // Index out of range
    ) {
      // Set the first image as the cover if no valid cover image exists
      setSelectedCoverIndex(0);
      updatedCoverImage = updatedGalleryImages[0];
    }

    updatedCoverImage =
      updatedGalleryImages[selectedCoverIndex] || updatedGalleryImages[0];

    // Update the session data with the new gallery images and cover image
    updateSession({
      ...sessionData,
      galleryImages: updatedGalleryImages,
      coverImage: updatedCoverImage,
    });

    clearValidationErrors();
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSetAsCover = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const index = Number(e.currentTarget.dataset.index);
    const selectedImage = sessionData.galleryImages?.[index];

    if (selectedImage) {
      setSelectedCoverIndex(index); // Update the store
      updateSession({
        ...sessionData,
        coverImage: selectedImage,
      });
      toast.success("Cover image updated successfully", {
        duration: Infinity,
        style: {
          background: "#ECFDF5",
          color: "#065F46",
          borderColor: "#34D399",
        },
      });
    }
  };

  const removeImage = (index: number) => {
    const updatedGalleryImages = sessionData.galleryImages.filter(
      (_, i) => i !== index
    );
    const updatedGalleryFiles = localGalleryFiles.filter((_, i) => i !== index);

    setLocalGalleryFiles(updatedGalleryFiles);

    if (updatedGalleryImages.length === 0) {
      // Handle case where all images are removed
      setSelectedCoverIndex(-1);
      updateSession({
        ...sessionData,
        galleryImages: updatedGalleryImages,
        coverImage: "",
      });
    } else if (index === selectedCoverIndex) {
      // If the removed image was the current cover, set the first image as the new cover
      setSelectedCoverIndex(0);
      updateSession({
        ...sessionData,
        galleryImages: updatedGalleryImages,
        coverImage: updatedGalleryImages[0],
      });
    } else {
      // Adjust selected cover index if necessary
      if (index < selectedCoverIndex) {
        setSelectedCoverIndex((prev) => prev - 1);
      }
      updateSession({
        ...sessionData,
        galleryImages: updatedGalleryImages,
      });
    }
  };

  // Handler for profile photo upload
  const handleProfileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target?.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > 2 * 1024 * 1024) {
      showErrorToast(VALIDATION_MESSAGES.profile.size, "profile-validation-error");
      return;
    }

    // Validate file format
    if (!["image/png", "image/jpeg", "image/jpg"].includes(file.type)) {
      showErrorToast(VALIDATION_MESSAGES.profile.format, "profile-validation-error");
      return;
    }

    setProfileFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  // Handler for profile update
  const handleUpdateProfile = async () => {
    if (!profileFile) return;

    setUploading(true);
    showLoadingToast("Uploading profile picture...", "profile-upload-loading");

    try {
      const signedUrl = await getSignedURL(profileFile.type, profileFile.size);

      if (signedUrl.failure !== undefined) {
        showErrorToast(signedUrl.failure, "image-validation-error");
        setProfileFile(undefined);
        setPreviewUrl(session?.user?.image || "");
        return;
      }

      const url = signedUrl.success.url;
      const res = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": profileFile.type || "application/octet-stream",
        },
        body: profileFile,
      });

      if (res.status === 200) {
        const updateRes = await fetch("/api/user/update", {
          method: "POST",
          body: JSON.stringify({
            image: signedUrl.success.key,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (updateRes.ok) {
          await update({
            ...session,
            user: {
              ...session?.user,
              image: signedUrl.success.key,
            },
          });
          toast.dismiss("profile-upload-loading");
          showSuccessToast(
            "Profile photo updated successfully",
            "profile-update-success"
          );
          setProfileFile(undefined); // Clear the profile file to hide the Save Photo button
        }
      }
    } catch (error) {
      console.error("Error updating profile photo:", error);
      showErrorToast("Failed to update profile photo", "profile-update-error");
    } finally {
      setUploading(false);
    }
  };

  // Loading state handler
  if (status === "loading") {
    return (
      <div className="fixed inset-0 bg-white/80 dark:bg-gray-900/80 flex justify-center items-center z-50">
        <div className="flex flex-col items-center space-y-4">
          <Loader />
          <p className="text-gray-600 dark:text-gray-300">
            Loading session data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Host Profile Section */}
      <Card className="p-4">
        <div className="flex items-center space-x-8">
          <div className="relative group">
            <div className="relative h-24 w-24">
              {previewUrl ? (
                <Image
                  src={previewUrl}
                  alt={session?.user?.name || "Host"}
                  fill
                  sizes="(max-width: 768px) 96px, 96px"
                  className="rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <span className="text-xl text-gray-500">
                    {session?.user?.name?.charAt(0) || "U"}
                  </span>
                </div>
              )}

              {/* Upload Overlay */}
              <label className="absolute inset-0 flex items-center justify-center rounded-full cursor-pointer bg-black/0 group-hover:bg-black/40 transition-all">
                <span className="hidden group-hover:block text-white">
                  <FaImage size={20} />
                </span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/png, image/jpeg, image/jpg"
                  onChange={handleProfileUpload}
                />
              </label>
            </div>

            {/* Upload Button - Show only when new file is selected */}
            {profileFile && (
              <button
                onClick={handleUpdateProfile}
                disabled={uploading}
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 text-xs bg-primary-500 text-white rounded-full shadow-lg hover:bg-primary-600 transition-colors"
              >
                {uploading ? (
                  <span className="flex items-center gap-2">
                    <div className="scale-75">
                      <Loader style="border-white" />
                    </div>
                    Uploading...
                  </span>
                ) : (
                  "Save Photo"
                )}
              </button>
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {session?.user?.name || "Session Host"}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Session Host
            </p>
          </div>
        </div>
      </Card>

      {/* Gallery Upload Section */}
      <FormItem
        label={
          <div className="flex items-center">
            Session Gallery
            <span className="text-red-500 ml-1">*</span>
            <span className="ml-2 text-sm text-neutral-500">
              ({sessionData.galleryImages.length}/5)
            </span>
          </div>
        }
        error={validationErrors.images}
      >
        <div className="space-y-6">
          {/* Image Preview Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {sessionData.galleryImages?.map((url, index) => (
              <div key={index} className="relative w-full group">
                <div className="relative aspect-[16/9] w-full">
                  <Image
                    src={url}
                    alt={`Gallery ${index + 1}`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className={`rounded-xl object-cover ${
                      index === selectedCoverIndex
                        ? "ring-4 ring-primary-500"
                        : ""
                    }`}
                  />
                  <div
                    className="absolute inset-0 bg-black bg-opacity-0 
                                      group-hover:bg-opacity-30 transition-all 
                                      duration-200 rounded-xl"
                  >
                    <div className="absolute top-3 right-3 flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={handleSetAsCover}
                        data-index={index}
                        className={`p-2 rounded-full text-white transition-all duration-200 
                              shadow-lg ${
                                index === selectedCoverIndex
                                  ? "bg-primary-500"
                                  : "bg-gray-800/70 hover:bg-primary-500"
                              } sm:opacity-0 sm:group-hover:opacity-100`}
                        aria-label={
                          index === selectedCoverIndex
                            ? "Current cover image"
                            : "Set as cover image"
                        }
                      >
                        <FaImage size={14} />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          removeImage(index);
                        }}
                        className="p-2 bg-red-500 rounded-full text-white 
                                     hover:bg-red-600 sm:opacity-0 sm:group-hover:opacity-100 
                                     transition-all duration-200 shadow-lg"
                        aria-label="Remove image"
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                  </div>

                  {index === selectedCoverIndex && (
                    <div
                      className="absolute bottom-3 left-3 px-3 py-1 
                                      bg-primary-500 text-white text-sm rounded-full 
                                      shadow-lg"
                    >
                      Cover Image
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Upload Button */}
            {sessionData.galleryImages.length < 5 && (
              <div className="relative w-full">
                <label
                  className={`relative aspect-[16/9] w-full block cursor-pointer group
                      ${
                        validationErrors.images
                          ? "border-red-500"
                          : "border-gray-300 dark:border-gray-700"
                      }`}
                >
                  <div
                    className={`absolute inset-0 flex flex-col items-center justify-center 
                        border-2 border-dashed rounded-xl
                        ${
                          validationErrors.images
                            ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                            : "border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
                        }
                        group-hover:border-primary-500 dark:group-hover:border-primary-500 
                        group-hover:bg-gray-100 dark:group-hover:bg-gray-800 
                        transition-all duration-200`}
                  >
                    <div className="flex flex-col items-center space-y-3">
                      <div
                        className="p-4 bg-white dark:bg-gray-700 rounded-full 
                                            group-hover:bg-primary-500 dark:group-hover:bg-primary-500 
                                            transition-colors duration-200"
                      >
                        <FaImages
                          className="text-2xl text-gray-400 group-hover:text-white 
                                                  transition-colors duration-200"
                        />
                      </div>
                      <div className="text-center px-4">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Click to upload images
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          PNG, JPG up to 2MB
                        </p>
                      </div>
                    </div>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/png, image/jpeg, image/jpg"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
              </div>
            )}
          </div>

          {/* Requirements Info */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2 mb-3">
              <FaImages className="text-gray-400" />
              <h4 className="font-medium text-gray-900 dark:text-white">
                Image Requirements
              </h4>
            </div>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-primary-500 rounded-full"></div>
                <span className="flex items-center">
                  Upload at least 1 image
                  <span className="text-red-500 ml-1">*</span>
                </span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-primary-500 rounded-full"></div>
                <span>Maximum 5 images allowed</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-primary-500 rounded-full"></div>
                <span>Supported formats: JPG, PNG</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-primary-500 rounded-full"></div>
                <span>Maximum size: 2MB per image</span>
              </li>
            </ul>
          </div>
        </div>
      </FormItem>
    </div>
  );
}
