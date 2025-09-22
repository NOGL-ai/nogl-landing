"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSessionStore } from "../store";
import PageAddListing1 from "./PageAddListing1";
import PageAddListing2 from "./PageAddListing2";
import PageAddListing3 from "./PageAddListing3";
import PageAddListing4 from "./PageAddListing4";
import PageAddListing5 from "./PageAddListing5";
import { validateStep, VALIDATION_MESSAGES, StepValidationKey, TOAST_STYLES } from "../validation";
import toast from 'react-hot-toast';
import { FiAlertCircle } from 'react-icons/fi';

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

export default Page;
