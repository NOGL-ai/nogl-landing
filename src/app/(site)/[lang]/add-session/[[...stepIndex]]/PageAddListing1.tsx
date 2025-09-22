"use client";
import { useSessionStore } from "../store";
import React, { FC, useState, useEffect } from "react";
import Input from "@/shared/Input";
import Select from "@/shared/Select";
import NcInputNumber from "@/components/NcInputNumber";
import FormItem from "../FormItem";
// Icons
import { FaChalkboardTeacher, FaUsers, FaVideo } from "react-icons/fa";
import { GiSkills } from "react-icons/gi";
import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline";
import {
  FaGraduationCap,
  FaChartLine,
  FaStar,
  FaClock,
  FaPalette,
  FaCode,
  FaBriefcase,
  FaLightbulb,
  FaCheckCircle,
  FaBalanceScale,
  FaHandshake,
  FaLaptopCode,
  FaCogs,
  FaUserTie,
  FaLeaf,
  FaCalculator,
} from "react-icons/fa";
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useHover,
  useInteractions,
  FloatingPortal,
} from "@floating-ui/react";
import { validateStep, VALIDATION_MESSAGES, TOAST_STYLES } from "../validation";
import { toast } from "react-hot-toast";

export interface PageAddListing1Props {}

const sessionTypeOptions = [
  {
    value: "One-on-One",
    icon: FaChalkboardTeacher,
    label: "One-on-One",
  },
  {
    value: "Group",
    icon: FaUsers,
    label: "Group",
  },
  {
    value: "Webinar",
    icon: FaVideo,
    label: "Webinar",
  },
];

const expertiseLevelOptions = [
  {
    value: "Beginner",
    icon: FaGraduationCap,
    label: "Beginner",
  },
  {
    value: "Intermediate",
    icon: FaChartLine,
    label: "Intermediate",
  },
  {
    value: "Advanced",
    icon: FaStar,
    label: "Advanced",
  },
];

const categoryOptions = [
  {
    value: "Finance",
    icon: FaCalculator,
    label: "Finance & Accounting"
  },
  {
    value: "Marketing",
    icon: FaChartLine,
    label: "Marketing & Branding"
  },
  {
    value: "Legal",
    icon: FaBalanceScale,
    label: "Legal Basics"
  },
  {
    value: "Innovation",
    icon: FaLightbulb,
    label: "Product Development"
  },
  {
    value: "Sales",
    icon: FaHandshake,
    label: "Sales"
  },
  {
    value: "HR",
    icon: FaUsers,
    label: "HR & Team Management"
  },
  {
    value: "Technology",
    icon: FaLaptopCode,
    label: "Technology & IT"
  },
  {
    value: "Operations",
    icon: FaCogs,
    label: "Operations & Scaling"
  },
  {
    value: "Leadership",
    icon: FaUserTie,
    label: "Leadership"
  },
  {
    value: "Sustainability",
    icon: FaLeaf,
    label: "Sustainability & CSR"
  },
];

const Tooltip = ({
  children,
  label,
  className = "",
}: {
  children: React.ReactNode;
  label: string;
  className?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: "top",
    middleware: [offset(5), flip(), shift()],
    whileElementsMounted: autoUpdate,
  });

  const hover = useHover(context, {
    move: false,
    enabled: true,
  });

  const { getReferenceProps, getFloatingProps } = useInteractions([hover]);

  return (
    <>
      <div ref={refs.setReference} {...getReferenceProps()} className="w-full">
        {children}
      </div>
      {isOpen && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
            className={`z-50 bg-neutral-900 text-white px-3 py-2 rounded-md text-sm max-w-xs ${className}`}
          >
            {label}
          </div>
        </FloatingPortal>
      )}
    </>
  );
};

const PageAddListing1: FC<PageAddListing1Props> = () => {
  const { 
    sessionData, 
    updateSession, 
    validationErrors,
    updateValidationErrors,
    clearValidationErrors 
  } = useSessionStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | 
       { target: { name: string; value: string } }
  ) => {
    const { name, value } = e.target;

    if (name === "sessionType") {
      if (value === "One-on-One") {
        updateSession({
          sessionType: value,
          minParticipants: 1,
          maxParticipants: 1,
        });
      } else if (value === "Group") {
        updateSession({
          sessionType: value,
          minParticipants: 2,
          maxParticipants: Math.max(sessionData.maxParticipants, 2),
        });
      } else {
        updateSession({
          sessionType: value,
          minParticipants: 1,
          maxParticipants: Math.max(sessionData.maxParticipants, 1),
        });
      }
    } else {
      updateSession({ [name]: value });
    }
    
    // Clear specific validation error when field is updated
    if (validationErrors[name]) {
      updateValidationErrors({
        ...validationErrors,
        [name]: ""
      });
    }
  };

  const handleNumberChange = (name: string, value: number) => {
    updateSession({ [name]: value });
    updateValidationErrors({
      ...validationErrors,
      [name]: ""
    });
  };

  const validate = () => {
    // Clear any existing toasts
    toast.dismiss();

    const error = validateStep(1, sessionData);
    if (error) {
      toast.error(error, {
        ...TOAST_STYLES.error,
        id: 'validation-error-1',
      });

      // Update validation errors in store
      updateValidationErrors({
        [`step1`]: error
      });
      return false;
    }

    clearValidationErrors();
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      // Proceed with form submission
      console.log("Session Data:", sessionData);
      // Implement actual submission logic here (e.g., API call)
    }
  };

  const handleParticipantChange = (
    field: "minParticipants" | "maxParticipants",
    increment: boolean
  ) => {
    const prev = sessionData;
    const newValue = increment ? prev[field] + 1 : prev[field] - 1;

    // Validation logic
    if (field === "minParticipants") {
      if (newValue < 1 || newValue > prev.maxParticipants) return;
      updateSession({
        minParticipants: newValue,
      });
    } else {
      if (newValue < prev.minParticipants || newValue > 100) return;
      updateSession({
        maxParticipants: newValue,
      });
    }
  };

  if (!isMounted) {
    return null; // or a loading skeleton
  }

  return (
    <div className="space-y-8">
      {/* Session Title - Updated with Tooltip */}
      <FormItem
        label={
          <div className="flex items-center">
            Session Title
            <span className="text-red-500 ml-1">*</span>
          </div>
        }
        error={validationErrors.sessionTitle}
      >
        <Tooltip label="Provide a catchy and descriptive title for your session">
          <div className="relative">
            <Input
              name="sessionTitle"
              placeholder="e.g., 'Mastering Digital Marketing Strategies'"
              value={sessionData.sessionTitle}
              onChange={handleChange}
              aria-describedby="sessionTitleError"
              className="pl-12 bg-white dark:bg-neutral-900 border-2 rounded-xl focus:border-primary-500 
                hover:border-neutral-300 dark:hover:border-neutral-600 transition-all duration-200"
            />
            <FaLightbulb className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-500 text-lg" />
          </div>
        </Tooltip>
        {!validationErrors.sessionTitle && sessionData.sessionTitle && (
          <div className="mt-2 text-xs text-green-600 dark:text-green-400 flex items-center">
            <FaCheckCircle className="mr-1" />
            Great title! Clear and descriptive
          </div>
        )}
      </FormItem>

      {/* Session Category - Updated UI */}
      <FormItem
        label={
          <div className="flex items-center">
            Session Category
            <span className="text-red-500 ml-1">*</span>
          </div>
        }
        error={validationErrors.sessionCategory}
      >
        <div className="grid grid-cols-5 gap-2">
          {categoryOptions.map((category) => {
            const Icon = category.icon;
            const isSelected = sessionData.sessionCategory === category.value;

            return (
              <button
                key={category.value}
                type="button"
                onClick={() =>
                  handleChange({
                    target: { name: "sessionCategory", value: category.value },
                  } as any)
                }
                className={`relative flex flex-col items-center h-full p-1.5 sm:p-2 rounded-xl border-2 transition-all duration-200 hover:shadow-md
                  ${
                    isSelected
                      ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                      : "border-neutral-200 hover:border-primary-300 dark:border-neutral-700 dark:hover:border-primary-500"
                  }
                `}
              >
                {isSelected && (
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary-500" />
                )}

                <div
                  className={`p-1.5 sm:p-2 rounded-lg mb-1 transition-colors
                    ${
                      isSelected
                        ? "bg-primary-500 text-white"
                        : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800"
                    }
                  `}
                >
                  <Icon className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                </div>

                <span
                  className={`font-medium text-[10px] sm:text-xs leading-tight text-center w-full px-0.5 transition-colors line-clamp-2
                    ${
                      isSelected
                        ? "text-primary-600 dark:text-primary-400"
                        : "text-neutral-900 dark:text-neutral-100"
                    }
                  `}
                >
                  {category.label}
                </span>
              </button>
            );
          })}
        </div>
      </FormItem>

      {/* Expertise Level */}
      <FormItem 
        label={
          <div className="flex items-center">
            Expertise Level
            <span className="text-red-500 ml-1">*</span>
          </div>
        }
      >
        <div className="grid grid-cols-3 gap-3">
          {expertiseLevelOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = sessionData.expertiseLevel === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  handleChange({
                    target: { name: "expertiseLevel", value: option.value },
                  } as any)
                }
                className={`relative flex flex-col items-center p-3 sm:p-4 rounded-xl border-2 transition-all duration-200
                  ${
                    isSelected
                      ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                      : "border-neutral-200 hover:border-primary-300 dark:border-neutral-700 dark:hover:border-primary-500"
                  }
                `}
              >
                {isSelected && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary-500" />
                )}

                <div
                  className={`p-2 sm:p-3 rounded-lg mb-2 transition-colors
                    ${
                      isSelected
                        ? "bg-primary-500 text-white"
                        : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800"
                    }
                  `}
                >
                  <Icon className="w-6 h-6" />
                </div>

                <span
                  className={`font-medium mb-1 transition-colors
                    ${
                      isSelected
                        ? "text-primary-600 dark:text-primary-400"
                        : "text-neutral-900 dark:text-neutral-100"
                    }
                  `}
                >
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>
      </FormItem>

      {/* Session Type */}
      <FormItem 
        label={
          <div className="flex items-center">
            Session Type
            <span className="text-red-500 ml-1">*</span>
          </div>
        }
      >
        <div className="grid grid-cols-3 gap-3 w-full">
          {sessionTypeOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = sessionData.sessionType === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  handleChange({
                    target: { name: "sessionType", value: option.value },
                  } as any)
                }
                className={`relative flex flex-col items-center w-full p-3 sm:p-4 rounded-xl border-2 transition-all duration-200
                  ${
                    isSelected
                      ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                      : "border-neutral-200 hover:border-primary-300 dark:border-neutral-700 dark:hover:border-primary-500"
                  }
                `}
              >
                {isSelected && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary-500" />
                )}

                <div
                  className={`p-2 sm:p-3 rounded-lg mb-2 transition-colors
                    ${
                      isSelected
                        ? "bg-primary-500 text-white"
                        : "bg-neutral-100 text-neutral-500 dark:bg-neutral-800"
                    }
                  `}
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>

                <span
                  className={`font-medium text-xs sm:text-sm text-center w-full transition-colors
                    ${
                      isSelected
                        ? "text-primary-600 dark:text-primary-400"
                        : "text-neutral-900 dark:text-neutral-100"
                    }
                  `}
                >
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>
      </FormItem>

      {/* Participants Section - Only show if not One-on-One */}
      {sessionData.sessionType !== "One-on-One" && (
        <FormItem 
          label={
            <div className="flex items-center">
              Participants
              <span className="text-red-500 ml-1">*</span>
            </div>
          }
        >
          <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Minimum Participants */}
              <div className="space-y-2">
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Minimum Participants
                </span>
                <div className="flex items-center justify-between p-3 bg-white dark:bg-neutral-900 rounded-lg">
                  <button
                    type="button"
                    className={`p-2 rounded-full ${
                      sessionData.minParticipants > 1
                        ? "bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700"
                        : "bg-neutral-50 text-neutral-400 cursor-not-allowed dark:bg-neutral-800"
                    }`}
                    onClick={() =>
                      handleParticipantChange("minParticipants", false)
                    }
                    disabled={sessionData.minParticipants <= 1}
                  >
                    <MinusIcon className="h-4 w-4" />
                  </button>
                  <span className="w-12 text-center font-medium text-lg">
                    {sessionData.minParticipants}
                  </span>
                  <button
                    type="button"
                    className={`p-2 rounded-full ${
                      sessionData.minParticipants <
                      sessionData.maxParticipants
                        ? "bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700"
                        : "bg-neutral-50 text-neutral-400 cursor-not-allowed dark:bg-neutral-800"
                    }`}
                    onClick={() =>
                      handleParticipantChange("minParticipants", true)
                    }
                    disabled={
                      sessionData.minParticipants >=
                      sessionData.maxParticipants
                    }
                  >
                    <PlusIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Maximum Participants */}
              <div className="space-y-2">
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Maximum Participants
                </span>
                <div className="flex items-center justify-between p-3 bg-white dark:bg-neutral-900 rounded-lg">
                  <button
                    type="button"
                    className={`p-2 rounded-full ${
                      sessionData.maxParticipants >
                      sessionData.minParticipants
                        ? "bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700"
                        : "bg-neutral-50 text-neutral-400 cursor-not-allowed dark:bg-neutral-800"
                    }`}
                    onClick={() =>
                      handleParticipantChange("maxParticipants", false)
                    }
                    disabled={
                      sessionData.maxParticipants <=
                      sessionData.minParticipants
                    }
                  >
                    <MinusIcon className="h-4 w-4" />
                  </button>
                  <span className="w-12 text-center font-medium text-lg">
                    {sessionData.maxParticipants}
                  </span>
                  <button
                    type="button"
                    className={`p-2 rounded-full ${
                      sessionData.maxParticipants < 100
                        ? "bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700"
                        : "bg-neutral-50 text-neutral-400 cursor-not-allowed dark:bg-neutral-800"
                    }`}
                    onClick={() =>
                      handleParticipantChange("maxParticipants", true)
                    }
                    disabled={sessionData.maxParticipants >= 100}
                  >
                    <PlusIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Helper text */}
            {/* <div className="mt-4 text-xs text-neutral-500 dark:text-neutral-400">
              Set the minimum and maximum number of participants for your group session
            </div> */}
            {/* <div className="mt-4 text-xs text-neutral-500 dark:text-neutral-400">
              Set the minimum and maximum number of participants for your webinar
            </div> */}
          </div>
        </FormItem>
      )}
    </div>
  );
};

export default PageAddListing1;
