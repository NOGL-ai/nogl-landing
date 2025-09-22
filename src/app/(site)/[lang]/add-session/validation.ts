import { SessionData } from "./store"; // Adjust import path as needed
import toast from 'react-hot-toast';

export const VALIDATION_MESSAGES = {
  images: {
    min: "Please upload at least 1 image",
    max: "Maximum 5 images allowed",
    format: "Invalid format. Use PNG or JPG.",
    size: "Maximum size is 2MB per image",
    noValid: "No valid images to upload.",
  },
  session: {
    title: {
      required: "Please enter a session title",
      minLength: "Title should be at least 5 characters long",
    },
    category: "Please select a session category",
    expertiseLevel: "Please select an expertise level",
    sessionType: "Please select a session type",
    participants: {
      oneOnOne: "One-on-One sessions are limited to 1 participant",
      groupMin: "Group sessions must have at least 2 minimum participants",
      min: "Please set at least 1 minimum participant",
      max: "Maximum participants cannot exceed 100",
      invalid: "Maximum participants should be greater than or equal to minimum participants",
    },
    date: {
      required: "Please select a session date",
      past: "Session date cannot be in the past",
    },
    time: {
      required: "Please select a start time",
      past: "Start time cannot be in the past",
    },
    duration: "Please select a valid session duration",
    description: {
      required: "Please provide a session description",
      minLength: "Session description should be at least 50 characters",
      maxLength: "Session description cannot exceed 2000 characters",
    },
    creation: {
      failed: "Failed to create session",
      success: "Session published successfully!"
    },
    publishing: "Publishing session..."
  },
  steps: {
    step1: "Please complete all required fields in Step 1",
    step2: "Please complete all required fields in Step 2",
    step3: "Please complete all required fields in Step 3",
    step4: "Please complete all required fields in Step 4",
    step5: "Please complete all required fields in Step 5"
  },
  upload: {
    failed: (index: number) => `Failed to upload image ${index + 1}`,
    generic: "Failed to upload images",
  },
  profile: {
    required: "Please upload a profile photo before creating a session",
    size: "Profile photo must be less than 2MB",
    format: "Only PNG, JPG and JPEG formats are supported",
    noImage: "A profile photo is required to create sessions"
  },
};

export const validateStep = (stepIndex: number, sessionData: SessionData) => {
  // Only validate if we're actually on the current step
  const currentPath = window.location.pathname;
  const currentStepMatch = currentPath.match(/\/add-session\/(\d+)/);
  const currentStep = currentStepMatch ? parseInt(currentStepMatch[1]) : 1;
  
  if (currentStep !== stepIndex) {
    return null;
  }

  switch (stepIndex) {
    case 1:
      if (!sessionData.sessionTitle?.trim()) {
        return VALIDATION_MESSAGES.session.title.required;
      }
      if (sessionData.sessionTitle.length < 5) {
        return VALIDATION_MESSAGES.session.title.minLength;
      }
      if (!sessionData.sessionCategory) {
        return VALIDATION_MESSAGES.session.category;
      }
      if (!sessionData.expertiseLevel) {
        return VALIDATION_MESSAGES.session.expertiseLevel;
      }
      if (!sessionData.sessionType) {
        return VALIDATION_MESSAGES.session.sessionType;
      }
      if (sessionData.sessionType === "Group" && sessionData.minParticipants < 2) {
        return VALIDATION_MESSAGES.session.participants.groupMin;
      }
      break;
    case 2:
      if (!sessionData.sessionDate) {
        return VALIDATION_MESSAGES.session.date.required;
      }
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const sessionDate = new Date(sessionData.sessionDate);
      sessionDate.setHours(0, 0, 0, 0);
      
      if (sessionDate < today) {
        return VALIDATION_MESSAGES.session.date.past;
      }
      if (!sessionData.startTime) {
        return VALIDATION_MESSAGES.session.time.required;
      }
      if (sessionDate.getTime() === today.getTime()) {
        const currentTime = new Date();
        const selectedTime = new Date(sessionData.startTime);
        
        if (selectedTime < currentTime) {
          return VALIDATION_MESSAGES.session.time.past;
        }
      }
      if (!sessionData.duration || sessionData.duration <= 0) {
        return VALIDATION_MESSAGES.session.duration;
      }
      break;
    case 3:
      if (!sessionData.description?.trim()) {
        return VALIDATION_MESSAGES.session.description.required;
      }
      if (sessionData.description.length < 50) {
        return VALIDATION_MESSAGES.session.description.minLength;
      }
      if (sessionData.description.length > 2000) {
        return VALIDATION_MESSAGES.session.description.maxLength;
      }
      break;
    case 4:
      if (!sessionData.galleryImages || sessionData.galleryImages.length < 1) {
        return VALIDATION_MESSAGES.images.min;
      }
      break;
  }
  return null;
}; 

export type StepValidationKey = `step${1 | 2 | 3 | 4 | 5}`; 

// Add toast style configurations
export const TOAST_STYLES = {
  error: {
    duration: Infinity,
    style: {
      background: '#FEF2F2',
      color: '#991B1B',
      borderColor: '#F87171',
    }
  },
  success: {
    duration: 3000,
    style: {
      background: '#ECFDF5',
      color: '#065F46',
      borderColor: '#34D399',
    }
  },
  loading: {
    duration: Infinity,
    style: {
      background: '#EFF6FF',
      color: '#1E40AF',
      borderColor: '#60A5FA',
    }
  }
} as const; 

export const showErrorToast = (message: string, id: string) => {
  toast.error(message, {
    ...TOAST_STYLES.error,
    id
  });
};

export const showSuccessToast = (message: string, id: string) => {
  toast.success(message, {
    ...TOAST_STYLES.success,
    id
  });
};

export const showLoadingToast = (message: string, id: string) => {
  toast.loading(message, {
    ...TOAST_STYLES.loading,
    id
  });
}; 