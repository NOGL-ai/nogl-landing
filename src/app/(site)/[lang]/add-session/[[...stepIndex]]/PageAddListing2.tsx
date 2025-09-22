"use client";
import { useSessionStore } from "../store";
import React, { FC, useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Input from "@/shared/Input";
import Select from "@/shared/Select";
import FormItem from "../FormItem";
import { VALIDATION_MESSAGES, TOAST_STYLES } from "../validation";
import toast from 'react-hot-toast';
// Icons
import {
  FaCalendarAlt,
  FaClock,
  FaMoneyBillWave,
  FaFileAlt,
  FaBrain,
  FaVideo,
  FaLock,
  FaDove,
} from "react-icons/fa";
import { MdOndemandVideo, MdPresentToAll } from "react-icons/md";
import { HiSparkles } from "react-icons/hi";

const upsellOptions = [
  {
    id: "slides",
    label: "Presentation Slides",
    description: "Downloadable slides from the session",
    icon: MdPresentToAll,
    price: 15,
  },
  {
    id: "recording",
    label: "Session Recording",
    description: "Full video recording of the session",
    icon: MdOndemandVideo,
    price: 20,
  },
  {
    id: "resources",
    label: "Additional Resources",
    description: "Extra materials and worksheets",
    icon: FaFileAlt,
    price: 10,
  },
  {
    id: "brainstorming",
    label: "Brainstorming Session",
    description: "Extended Q&A and ideation",
    icon: FaBrain,
    price: 25,
  },
];

const durationOptions = [
  { value: 0.5, label: "30 mins" },
  { value: 1, label: "1 hour" },
  { value: 1.5, label: "1.5 hours" },
  { value: 2, label: "2 hours" },
  { value: 3, label: "3 hours" },
  { value: 4, label: "4 hours" },
  { value: 5, label: "5 hours" },
  { value: 6, label: "6 hours" },
];

export interface PageAddListing2Props {}

const PageAddListing2: FC<PageAddListing2Props> = () => {
  const [isMounted, setIsMounted] = useState(false);
  const { 
    sessionData, 
    updateSession, 
    updateValidationErrors, 
    clearValidationErrors,
    validationErrors 
  } = useSessionStore();

  // State to handle UI date and time separately
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);

  useEffect(() => {
    setIsMounted(true);

    // Only set initial values if there's no existing date and time
    if (!sessionData.sessionDate && !sessionData.startTime) {
      const now = new Date();
      // Round to nearest 15 minutes
      const minutes = Math.ceil(now.getMinutes() / 15) * 15;
      now.setMinutes(minutes);
      now.setSeconds(0);
      now.setMilliseconds(0);
      setSelectedDate(now);
      setSelectedTime(now);
      updateSession({ 
        sessionDate: now,
        startTime: now
      });
    } else {
      // If we have existing data, use it
      if (sessionData.sessionDate) {
        setSelectedDate(new Date(sessionData.sessionDate));
      }
      if (sessionData.startTime) {
        setSelectedTime(new Date(sessionData.startTime));
      }
    }
  }, []);

  const validateDateTime = () => {
    const errors: Record<string, string> = {};
    
    // Add base price validation
    if (sessionData.basePrice === undefined || sessionData.basePrice === null || sessionData.basePrice < 0) {
      errors.basePrice = "Please enter a valid base price (minimum 0)";
    }

    // Date validation
    if (!sessionData.sessionDate) {
      errors.sessionDate = VALIDATION_MESSAGES.session.date.required;
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const sessionDate = new Date(sessionData.sessionDate);
      sessionDate.setHours(0, 0, 0, 0);
      
      if (sessionDate < today) {
        errors.sessionDate = VALIDATION_MESSAGES.session.date.past;
      }
    }

    // Time validation
    if (!sessionData.startTime) {
      errors.startTime = VALIDATION_MESSAGES.session.time.required;
    } else if (
      sessionData.sessionDate && 
      new Date(sessionData.sessionDate).toDateString() === new Date().toDateString()
    ) {
      const currentTime = new Date();
      const selectedTime = new Date(sessionData.startTime);
      
      if (selectedTime < currentTime) {
        errors.startTime = VALIDATION_MESSAGES.session.time.past;
      }
    }

    // Duration validation
    if (!sessionData.duration || sessionData.duration <= 0) {
      errors.duration = VALIDATION_MESSAGES.session.duration;
    }

    // Timezone validation (add to validation.ts first)
    if (!sessionData.timeZone) {
      errors.timeZone = "Please select a time zone";
    }

    if (Object.keys(errors).length > 0) {
      updateValidationErrors(errors);
      
      // Show toast for first error
      const firstError = Object.values(errors)[0];
      toast.error(firstError, {
        ...TOAST_STYLES.error,
        id: 'validation-error-2',
      });
      return false;
    }
    
    clearValidationErrors();
    return true;
  };

  // Handler for date and time changes
  const handleDateTimeChange = (field: 'date' | 'time', value: Date | null) => {
    if (field === 'date') {
      setSelectedDate(value);
      updateSession({ 
        sessionDate: value  // Use sessionDate to match the interface
      });
    } else {
      setSelectedTime(value);
      if (value) {
        updateSession({ 
          startTime: value
        });
      }
    }

    // Clear validation errors
    if (validationErrors.startTime || validationErrors.sessionDate) {
      const updatedErrors = { ...validationErrors };
      delete updatedErrors.startTime;
      delete updatedErrors.sessionDate;
      updateValidationErrors(updatedErrors);
    }
  };

  // New handler specifically for timezone
  const handleTimezoneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    updateSession({ timeZone: value });
    if (validationErrors.timeZone) {
      const updatedErrors = { ...validationErrors };
      delete updatedErrors.timeZone;
      updateValidationErrors(updatedErrors);
    }
  };

  // Handler for duration selection
  const handleDurationSelect = (value: number) => {
    updateSession({ duration: value });
    if (validationErrors.duration) {
      const updatedErrors = { ...validationErrors };
      delete updatedErrors.duration;
      updateValidationErrors(updatedErrors);
    }
  };

  if (!isMounted) return null;

  return (
    <>
      <div className="space-y-8">
        {/* Duration Section */}
        <FormItem
          label={
            <div className="flex items-center">
              Session Duration
              <span className="text-red-500 ml-1">*</span>
            </div>
          }
          error={validationErrors.duration}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {durationOptions.map((option) => {
              const isSelected = sessionData.duration === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleDurationSelect(option.value)}
                  className={`relative flex items-center justify-center p-4 rounded-xl border-2 
                    transition-all duration-200 ${
                      isSelected
                        ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                        : "border-neutral-200 hover:border-primary-300 dark:border-neutral-700 dark:hover:border-primary-500"
                    } ${validationErrors.duration ? "border-red-500" : ""}`}
                >
                  {isSelected && (
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary-500" />
                  )}
                  <div className="flex flex-col items-center">
                    <FaClock
                      className={`w-5 h-5 mb-2 ${
                        isSelected ? "text-primary-500" : "text-neutral-500"
                      }`}
                    />
                    <span
                      className={`font-medium ${
                        isSelected ? "text-primary-600" : "text-neutral-700"
                      }`}
                    >
                      {option.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </FormItem>

        {/* DateTime Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Session Date */}
          <FormItem 
            label={
              <div className="flex items-center">
                Session Date
                <span className="text-red-500 ml-1">*</span>
              </div>
            }
            error={validationErrors.sessionDate}
          >
            <div className="relative">
              <DatePicker
                selected={selectedDate}
                onChange={(date) => handleDateTimeChange('date', date)}
                dateFormat="MMMM d, yyyy"
                placeholderText="Select date"
                minDate={new Date()}
                className={`w-full pl-12 p-4 bg-white dark:bg-neutral-900 border-2 rounded-xl
                  focus:border-primary-500 hover:border-neutral-300 dark:hover:border-neutral-600 
                  transition-all duration-200 shadow-sm
                  ${validationErrors.sessionDate ? "border-red-500" : ""}`}
                calendarClassName="custom-datepicker"
              />
              <FaCalendarAlt className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-500 text-lg" />
            </div>
          </FormItem>

          {/* Start Time */}
          <FormItem 
            label={
              <div className="flex items-center">
                Start Time
                <span className="text-red-500 ml-1">*</span>
              </div>
            }
            error={validationErrors.startTime}
          >
            <div className="relative">
              <DatePicker
                selected={selectedTime}
                onChange={(time) => handleDateTimeChange('time', time)}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={15}
                timeCaption="Time"
                dateFormat="h:mm aa"
                placeholderText="Select time"
                className={`w-full pl-12 p-4 bg-white dark:bg-neutral-900 border-2 rounded-xl
                  focus:border-primary-500 hover:border-neutral-300 dark:hover:border-neutral-600 
                  transition-all duration-200 shadow-sm
                  ${validationErrors.startTime ? "border-red-500" : ""}`}
              />
              <FaClock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-500 text-lg" />
            </div>
          </FormItem>

          {/* Time Zone */}
          <FormItem 
            label={
              <div className="flex items-center">
                Time Zone
                <span className="text-red-500 ml-1">*</span>
              </div>
            }
            error={validationErrors.timeZone}
          >
            <div className="relative">
              <Select
                value={sessionData.timeZone}
                onChange={handleTimezoneChange}
                style={{ width: "100%", height: "100%", padding: "1rem" }}
                className={`bg-white dark:bg-neutral-900 border-2 rounded-xl
                  focus:border-primary-500 hover:border-neutral-300 dark:hover:border-neutral-600 
                  transition-all duration-200 shadow-sm
                  ${validationErrors.timeZone ? "border-red-500" : ""}`}
              >
                <option value="">Select timezone</option>
                <option value="CET">CET (European)</option>
                <option value="UTC">UTC (Universal)</option>
                <option value="EST">EST (Eastern)</option>
                <option value="CST">CST (Central)</option>
                <option value="PST">PST (Pacific)</option>
              </Select>
            </div>
          </FormItem>
        </div>

        {/* Community Access Toggle - New Addition */}
        <FormItem
          label={
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span>EmpowHerCircle Community Access</span>
                <div className="px-2 py-1 text-xs bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full">
                  EmpowHerNetwork
                </div>
              </div>
            </div>
          }
          desc="Enable this to make your session exclusive to EmpowHerCircle community members"
        >
          <div className="flex items-center space-x-3 p-4 bg-white dark:bg-neutral-900 border-2 rounded-xl
            border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 
            transition-all duration-200">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={sessionData.isCircleCommunity}
                onChange={(e) => updateSession({ isCircleCommunity: e.target.checked })}
              />
              <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 
                peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer 
                dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white 
                after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white 
                after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 
                after:transition-all dark:border-neutral-600 peer-checked:bg-primary-600" />
            </label>
            <span className="text-sm text-neutral-600 dark:text-neutral-400">
              {sessionData.isCircleCommunity ? 'Exclusive to EmpowHerCircle members' : 'Open to all participants'}
            </span>
          </div>
        </FormItem>

        {/* Pricing Section - Only show if not community access */}
        {!sessionData.isCircleCommunity && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Base Price */}
            <FormItem
              label={
                <div className="flex items-center">
                  Base Price
                  <span className="text-red-500 ml-1">*</span>
                </div>
              }
              error={validationErrors.basePrice}
            >
              <div className="relative">
                <Input
                  type="number"
                  min={0}
                  value={sessionData.basePrice === 0 ? '' : sessionData.basePrice ?? ''}
                  onChange={(e) => {
                    const inputValue = e.target.value;
                    // Allow empty input
                    if (inputValue === '') {
                      updateSession({ basePrice: undefined });
                    } else {
                      const value = Number(inputValue);
                      if (!isNaN(value) && value >= 0) {
                        updateSession({ basePrice: value });
                      }
                    }
                    // Clear validation error when field is updated
                    if (validationErrors.basePrice) {
                      const updatedErrors = { ...validationErrors };
                      delete updatedErrors.basePrice;
                      updateValidationErrors(updatedErrors);
                    }
                  }}
                  placeholder="39"
                  className={`w-full pl-12 p-4 bg-white dark:bg-neutral-900 border-2 rounded-xl
                    focus:border-primary-500 hover:border-neutral-300 dark:hover:border-neutral-600 
                    transition-all duration-200 ${validationErrors.basePrice ? "border-red-500" : ""}`}
                />
                <FaMoneyBillWave className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-500 text-lg" />
              </div>
            </FormItem>

            {/* Discounts */}
            <FormItem
              label={
                <div className="flex items-center space-x-2">
                  <span>Discounts</span>
                  <span className="px-2 py-1 text-xs bg-neutral-200 dark:bg-neutral-700 rounded-full">
                    Coming Soon
                  </span>
                </div>
              }
            >
              <div className="relative">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  defaultValue={10}
                  disabled
                  placeholder="e.g., 10"
                  className="w-full pl-12 p-4 bg-neutral-100 dark:bg-neutral-800 border-2 rounded-xl
                    border-neutral-200 dark:border-neutral-700 cursor-not-allowed shadow-sm"
                />
                <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-500 text-lg" />
              </div>
            </FormItem>

            {/* Early Bird */}
            <FormItem
              label={
                <div className="flex items-center space-x-2">
                  <span>Early Bird</span>
                  <span className="px-2 py-1 text-xs bg-neutral-200 dark:bg-neutral-700 rounded-full">
                    Coming Soon
                  </span>
                </div>
              }
            >
              <div className="relative">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  defaultValue={10}
                  disabled
                  placeholder="e.g., 10"
                  className="w-full pl-12 p-4 bg-neutral-100 dark:bg-neutral-800 border-2 rounded-xl
                    border-neutral-200 dark:border-neutral-700 cursor-not-allowed shadow-sm"
                />
                <FaDove className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-500 text-lg" />
              </div>
            </FormItem>
          </div>
        )}

        {/* Upsell Options */}
        <FormItem
          label={
            <div className="flex items-center space-x-2">
              <span>Upsell Options</span>
              <span className="px-2 py-1 text-xs bg-neutral-200 dark:bg-neutral-700 rounded-full">
                Coming Soon
              </span>
            </div>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {upsellOptions.map((option) => {
              const Icon = option.icon;
              return (
                <div
                  key={option.id}
                  className="flex flex-col items-center p-4 border-2 rounded-xl
                    border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 
                    cursor-not-allowed"
                >
                  <div className="p-3 bg-neutral-200 dark:bg-neutral-700 rounded-full mb-3">
                    <Icon className="w-6 h-6 text-neutral-500" />
                  </div>
                  <h3 className="font-medium text-neutral-700 dark:text-neutral-300 text-center">
                    {option.label}
                  </h3>
                  <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400 text-center">
                    €{option.price}
                  </p>
                </div>
              );
            })}
          </div>
        </FormItem>
      </div>

      {/* Add custom styles for the DatePicker */}
      <style jsx global>{`
        .react-datepicker {
          font-family: inherit;
          border: none;
          border-radius: 1rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        .react-datepicker__header {
          background-color: #f3f4f6;
          border-bottom: none;
          border-radius: 1rem 1rem 0 0;
        }
        .react-datepicker__day--selected {
          background-color: #6366f1;
          border-radius: 0.5rem;
        }
        .react-datepicker__time-container {
          border-left: none;
        }
      `}</style>
    </>
  );
};

export default PageAddListing2;
