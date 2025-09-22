// File: src/components/BenefitsModal.tsx
'use client';

import { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import ButtonClose from '@/shared/ButtonClose';
import ButtonSecondary from '@/shared/ButtonSecondary';
import { SessionWithExpert } from '@/types/session';

const FALLBACK_BENEFITS = [
  { id: "1", name: "Transcript available", icon: "la-file-alt" },
  { id: "2", name: "Interactive Q&A sessions", icon: "la-comments" },
  { id: "3", name: "Dynamic content", icon: "la-play" },
  { id: "4", name: "Access to recordings", icon: "la-video" },
  { id: "5", name: "Practical examples", icon: "la-lightbulb" },
  { id: "6", name: "Handouts and materials", icon: "la-book" },
  { id: "7", name: "Discussion", icon: "la-users" },
  { id: "8", name: "Introductory and advanced options", icon: "la-chart-line" },
  { id: "9", name: "Community access", icon: "la-user-friends" },
];

interface BenefitsModalProps {
  session: SessionWithExpert;
}

const BenefitsModal: React.FC<BenefitsModalProps> = ({ session }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Use session benefits if available, otherwise use fallback
  const benefits = session.benefits?.length > 0 ? session.benefits : FALLBACK_BENEFITS;

  const openModalBenefits = () => {
    setIsOpen(true);
  };

  const closeModalBenefits = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Display Benefits */}
      <div className="grid grid-cols-2 gap-2 text-sm text-neutral-700 dark:text-neutral-300 sm:grid-cols-3 sm:gap-6">
        {benefits.slice(0, 6).map((item) => (
          <div key={item.id} className="flex items-center space-x-1.5 sm:space-x-3">
            <i className={`las text-xl sm:text-3xl ${item.icon}`}></i>
            <span className="text-[11px] leading-tight sm:text-sm">{item.name}</span>
          </div>
        ))}
      </div>

      {benefits.length > 6 && (
        <>
          <div className="w-14 border-b border-neutral-200 dark:border-neutral-700 mt-2 sm:mt-6"></div>
          <div className="flex justify-center mt-2 sm:mt-6">
            <ButtonSecondary 
              onClick={openModalBenefits}
              className="text-xs py-1.5 px-3 sm:text-sm sm:py-2.5 sm:px-5"
            >
              View more benefits
            </ButtonSecondary>
          </div>
        </>
      )}

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-50 overflow-y-auto"
          onClose={closeModalBenefits}
        >
          <div className="min-h-screen px-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black bg-opacity-40" />
            </Transition.Child>

            <span className="inline-block h-screen align-middle" aria-hidden="true">
              &#8203;
            </span>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="inline-block h-screen w-full max-w-4xl py-8">
                <div className="inline-flex h-full w-full transform flex-col overflow-hidden rounded-2xl bg-white pb-2 text-left align-middle shadow-xl transition-all dark:border dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100">
                  <div className="relative flex-shrink-0 border-b border-neutral-200 px-6 py-4 text-center dark:border-neutral-800">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                      Benefits
                    </h3>
                    <span className="absolute left-3 top-3">
                      <ButtonClose onClick={closeModalBenefits} />
                    </span>
                  </div>
                  <div className="divide-y divide-neutral-200 overflow-auto px-3 sm:px-8 text-neutral-700 dark:text-neutral-300">
                    {benefits.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center space-x-2 sm:space-x-5 py-2 sm:py-4"
                      >
                        <i className={`las text-2xl sm:text-4xl text-neutral-6000 ${item.icon}`}></i>
                        <span className="text-xs sm:text-base">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default BenefitsModal;
