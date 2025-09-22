// COMMENTED OUT - Add Session page disabled for build optimization
// "use client";
// import React, { useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { useSessionStore } from "../store";
// import PageAddListing1 from "./PageAddListing1";
// import PageAddListing2 from "./PageAddListing2";
// import PageAddListing3 from "./PageAddListing3";
// import PageAddListing4 from "./PageAddListing4";
// import PageAddListing5 from "./PageAddListing5";
// import { validateStep, VALIDATION_MESSAGES, StepValidationKey, TOAST_STYLES } from "../validation";
// import toast from 'react-hot-toast';
// import { FiAlertCircle } from 'react-icons/fi';

// COMMENTED OUT - Add Session component disabled for build optimization
/*
const Page = ({
  params,
}: {
  params: { stepIndex: string };
}) => {
  const router = useRouter();
  const { 
    sessionData, 
    validationErrors,
    updateValidationErrors,
    clearValidationErrors 
  } = useSessionStore();
  
  const stepIndex = parseInt(params.stepIndex?.[0] || "1");

  useEffect(() => {
    // Dismiss only success toasts
    toast.dismiss('publish-success');
    toast.dismiss('cover-image-success');
    
    // Clear validation errors when moving to a new step
    const stepKey = `step${stepIndex}` as StepValidationKey;
    updateValidationErrors({
      [stepKey]: ''
    });
  }, [stepIndex, updateValidationErrors]);

  let ContentComponent = PageAddListing1;

  switch (stepIndex) {
    case 1:
      ContentComponent = PageAddListing1;
      break;
    case 2:
      ContentComponent = PageAddListing2;
      break;
    case 3:
      ContentComponent = PageAddListing3;
      break;
    case 4:
      ContentComponent = PageAddListing4;
      break;
    case 5:
      ContentComponent = PageAddListing5;
      break;
    default:
      ContentComponent = PageAddListing1;
      break;
  }

  return <ContentComponent />;
};
*/

// Placeholder component to prevent build errors
const Page = ({
  params,
}: {
  params: { stepIndex: string };
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Add Session Temporarily Unavailable
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          This feature has been temporarily disabled for build optimization.
        </p>
      </div>
    </div>
  );
};

export default Page;
