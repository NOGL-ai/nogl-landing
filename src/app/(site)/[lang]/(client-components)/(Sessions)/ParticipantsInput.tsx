"use client";

import React, { Fragment, FC } from "react";
import { Popover, Transition } from "@headlessui/react";
import NcInputNumber from "@/components/NcInputNumber";
import { UserPlusIcon } from "@heroicons/react/24/outline";
import ClearDataButton from "@/app/(site)/[lang]/(client-components)/(HeroSearchFormSmall)/ClearDataButton";

export interface ParticipantsInputProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
}

const ParticipantsInput: FC<ParticipantsInputProps> = ({
  className = "flex-1",
  placeholder = "Number of Participants",
  value,
  onChange,
}) => {
  const renderParticipantText = () => {
    if (value === 1) {
      return "Just you";
    }
    return `${value} participants`;
  };

  return (
    <Popover className={`flex relative ${className}`}>
      {({ open }) => (
        <>
          <div
            className={`flex-1 flex items-center focus:outline-none rounded-b-3xl ${
              open ? "shadow-lg" : ""
            }`}
          >
            <Popover.Button
              className={`relative z-10 flex-1 flex text-left items-center p-3 space-x-3 focus:outline-none`}
            >
              <div className="text-neutral-300 dark:text-neutral-400">
                <UserPlusIcon className="w-5 h-5 lg:w-7 lg:h-7" />
              </div>
              <div className="flex-grow">
                <span className="block xl:text-lg font-semibold">
                  {renderParticipantText()}
                </span>
                <span className="block mt-1 text-sm text-neutral-400 leading-none font-light">
                  {value === 1 ? "Add more participants" : "Including you"}
                </span>
              </div>

              {value > 1 && open && (
                <ClearDataButton
                  onClick={() => {
                    onChange(1);
                  }}
                />
              )}
            </Popover.Button>
          </div>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <Popover.Panel className="absolute right-0 z-10 w-full sm:min-w-[340px] max-w-sm bg-white dark:bg-neutral-800 top-full mt-3 py-5 sm:py-6 px-4 sm:px-8 rounded-3xl shadow-xl ring-1 ring-black ring-opacity-5">
              <div className="relative flex flex-col space-y-8">
                <div className="space-y-3">
                  <span className="font-medium">Number of participants</span>
                  <br />
                  <span className="text-sm text-neutral-500 dark:text-neutral-400">
                    Including yourself as the main participant
                  </span>
                </div>

                <NcInputNumber
                  className="w-full"
                  defaultValue={value}
                  onChange={(value) => onChange(value)}
                  max={10}
                  min={1}
                  label="Participants"
                />

                {value > 1 && (
                  <div className="text-sm text-neutral-500 dark:text-neutral-400 italic">
                    You'll be able to provide details for additional participants later
                  </div>
                )}
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
};

export default ParticipantsInput;
