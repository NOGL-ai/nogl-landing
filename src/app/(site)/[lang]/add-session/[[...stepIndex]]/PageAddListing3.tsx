"use client";
import dynamic from 'next/dynamic';
import DOMPurify from 'dompurify';
import 'react-quill/dist/quill.snow.css';
import { useSessionStore } from "../store";
import React, { FC, useState, useEffect } from "react";
import FormItem from "../FormItem";
import Input from "@/shared/Input";
import Button from "@/shared/Button";
import { FaPlus, FaTrash, FaGift, FaTags } from "react-icons/fa";
import { VALIDATION_MESSAGES, TOAST_STYLES } from "../validation";
import { toast } from 'react-hot-toast';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['link'],
    ['clean']
  ],
  clipboard: {
    matchVisual: false,
    matchers: []
  },
  keyboard: {
    bindings: {}
  },
  history: {
    delay: 2000,
    maxStack: 500,
    userOnly: true
  }
};

const formats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'list', 'bullet',
  'link'
];

export interface PageAddListing3Props {}

const PageAddListing3: FC<PageAddListing3Props> = () => {
  const { 
    sessionData, 
    updateSession,
    validationErrors,
    updateValidationErrors,
    clearValidationErrors 
  } = useSessionStore();
  const [tagInput, setTagInput] = useState("");
  const [charCount, setCharCount] = useState<number>(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const plainText = sessionData.description?.replace(/<[^>]+>/g, '') || '';
    setCharCount(plainText.length);
  }, [sessionData.description]);

  const addBenefit = () => {
    updateSession({
      additionalBenefits: [
        ...sessionData.additionalBenefits,
        { name: "" },
      ],
    });
  };

  const removeBenefit = (index: number) => {
    const newBenefits = sessionData.additionalBenefits.filter (
      (_, i) => i !== index
    );
    updateSession({ additionalBenefits: newBenefits });
  };

  const updateBenefit = (index: number, value: string) => {
    const newBenefits = [...sessionData.additionalBenefits];
    newBenefits[index] = { ...newBenefits[index], name: value };
    updateSession({ additionalBenefits: newBenefits });
  };

  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !sessionData.tags.includes(tag) && sessionData.tags.length < 5) {
      updateSession({ tags: [...sessionData.tags, tag] });
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    updateSession({
      tags: sessionData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const handleDescriptionChange = (content: string) => {
    const sanitizedContent = DOMPurify.sanitize(content);
    const plainText = sanitizedContent.replace(/<[^>]+>/g, '');
    
    updateSession({ description: sanitizedContent });
    setCharCount(plainText.length);

    // Clear any existing validation toasts
    toast.dismiss();

    if (!plainText.trim()) {
      updateValidationErrors({
        description: VALIDATION_MESSAGES.session.description.required
      });
    } else if (plainText.length < 50) {
      updateValidationErrors({
        description: VALIDATION_MESSAGES.session.description.minLength
      });
    } else if (plainText.length > 2000) {
      updateValidationErrors({
        description: VALIDATION_MESSAGES.session.description.maxLength
      });
    } else {
      clearValidationErrors();
    }
  };

  if (!isMounted) return null;

  return (
    <div className="space-y-8">
      {/* Session Description with ReactQuill */}
      <FormItem
        label={
          <div className="flex items-center">
            Session Description
            <span className="text-red-500 ml-1">*</span>
          </div>
        }
        desc="Provide a detailed overview of your session content and what participants will learn"
        error={validationErrors.description}
      >
        <div className="relative">
          <ReactQuill
            value={sessionData.description || ""}
            onChange={handleDescriptionChange}
            modules={modules}
            formats={formats}
            placeholder="Describe your session in detail..."
            className={`w-full bg-white dark:bg-neutral-900 rounded-xl
              focus:border-primary-500 hover:border-neutral-300 
              dark:hover:border-neutral-600 transition-all duration-200 
              ${validationErrors.description ? 'border-red-500' : ''}`}
            theme="snow"
            preserveWhitespace={true}
          />
          <div className="absolute bottom-2 right-2 text-sm text-neutral-500">
            {charCount}/2000
          </div>
        </div>
      </FormItem>

      {/* Tags Section */}
      {isMounted && (
        <FormItem
          label={
            <div className="flex items-center space-x-2">
              <span>Session Tags</span>
              <FaTags className="text-neutral-500" />
            </div>
          }
          desc="Add up to 5 tags to help participants find your session (Press Enter or comma to add)"
        >
          <div className="space-y-3">
            {/* Tags Display */}
            <div className="flex flex-wrap gap-2 min-h-[2.5rem]">
              {sessionData.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-1.5 rounded-full 
                                 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300
                                 text-sm"
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="ml-2 text-primary-500 hover:text-primary-700 dark:hover:text-primary-300"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            {/* Tag Input */}
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagInput}
              placeholder="Type and press Enter or comma to add tags..."
              className="w-full p-4 bg-white dark:bg-neutral-900 border-2 rounded-xl
                    focus:border-primary-500 hover:border-neutral-300 dark:hover:border-neutral-600 
                    transition-all duration-200"
              maxLength={20}
              disabled={sessionData.tags.length >= 5}
            />

            {/* Max Tags Warning */}
            {sessionData.tags.length >= 5 && (
              <p className="text-sm text-red-500">
                Maximum number of tags reached (5)
              </p>
            )}
          </div>
        </FormItem>
      )}

      {/* Additional Benefits Section */}
      {isMounted && (
        <FormItem
          label={
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span>Additional Benefits</span>
                <FaGift className="text-neutral-500" />
                <span className="px-2 py-1 text-xs bg-neutral-200 dark:bg-neutral-700 rounded-full">
                  Coming Soon
                </span>
              </div>
              <Button
                className="flex items-center space-x-2 text-sm"
                onClick={() => addBenefit()}
                type="button"
                disabled
              >
                <FaPlus />
                <span>Add Benefit</span>
              </Button>
            </div>
          }
          desc="List any additional benefits beyond our standard platform offerings"
        >
          <div className="space-y-3 opacity-50 pointer-events-none">
            {sessionData.additionalBenefits.map((benefit, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="relative flex-grow">
                  <Input
                    value={benefit.name}
                    onChange={(e) => updateBenefit(index, e.target.value)}
                    placeholder="e.g., Private mentoring session, Course materials, etc."
                    className="w-full p-4 bg-white dark:bg-neutral-900 border-2 rounded-xl
                          focus:border-primary-500 hover:border-neutral-300 dark:hover:border-neutral-600 
                          transition-all duration-200"
                  />
                </div>
                {sessionData.additionalBenefits.length > 1 && (
                  <Button
                    className="text-red-500 hover:text-red-600"
                    onClick={() => removeBenefit(index)}
                  >
                    <FaTrash />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </FormItem>
      )}

      {/* Platform Benefits Info Box */}
      {isMounted && (
        <div className="p-4 bg-neutral-100 dark:bg-neutral-800 rounded-xl">
          <h4 className="font-medium mb-2">Platform Standard Benefits</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                  Transcript available
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                  Access to recordings
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                  Discussion
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                  Community access
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PageAddListing3;