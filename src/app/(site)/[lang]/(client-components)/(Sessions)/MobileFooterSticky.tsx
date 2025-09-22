import React, { FC, useState } from "react";
import ButtonPrimary from "@/shared/ButtonPrimary";
import { SessionWithExpert } from "@/types/session";
import { Dialog, Transition } from '@headlessui/react';
import { MinusIcon, PlusIcon } from '@heroicons/react/24/outline';
import ParticipantsInput from './ParticipantsInput';
import { useRouter } from 'next/navigation';

interface MobileFooterStickyProps {
  session: SessionWithExpert;
  total: number;
  basePrice: number;
  participants: number;
  handleBookNow?: () => void;
}

const MobileFooterSticky: FC<MobileFooterStickyProps> = ({
  session,
  total,
  basePrice,
  participants,
  handleBookNow = () => {}
}) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [localParticipants, setLocalParticipants] = useState(participants);
  const [includeRecording, setIncludeRecording] = useState(false);
  const [recordingCount, setRecordingCount] = useState(1);
  
  const recordingPrice = 20;
  const localTotal = localParticipants * basePrice + 
    (includeRecording ? recordingCount * recordingPrice : 0);

  const handleRecordingCountChange = (value: number) => {
    if (value >= 1 && value <= localParticipants) {
      setRecordingCount(value);
    }
  };

  const handleCheckout = () => {
    const queryParams = new URLSearchParams({
      sessionId: session.id,
      participants: localParticipants.toString(),
      includeRecording: includeRecording.toString(),
      recordingCount: recordingCount.toString(),
      total: localTotal.toString()
    }).toString();

    router.push(`/checkout?${queryParams}`);
  };

  return (
    <>
      <div className="block lg:hidden fixed bottom-0 inset-x-0 py-2 sm:py-3 bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-6000 z-40">
        <div className="container flex items-center justify-between">
          <div className="cursor-pointer" onClick={() => setIsOpen(true)}>
            <span className="block text-xl font-semibold">
              €{basePrice}
              <span className="ml-1 text-sm font-normal text-neutral-500 dark:text-neutral-400">
                /session
              </span>
            </span>
            <span className="block text-sm text-neutral-500 dark:text-neutral-400">
              {localParticipants} {localParticipants === 1 ? 'participant' : 'participants'} · Total: €{localTotal}
            </span>
          </div>

          <ButtonPrimary
            onClick={handleCheckout}
            sizeClass="px-5 sm:px-7 py-3 !rounded-2xl"
          >
            Book Now
          </ButtonPrimary>
        </div>
      </div>

      <Transition show={isOpen} as={React.Fragment}>
        <Dialog 
          as="div" 
          className="fixed inset-0 z-50 overflow-y-auto" 
          onClose={() => setIsOpen(false)}
        >
          <div className="min-h-screen text-center">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black bg-opacity-40" />
            </Transition.Child>

            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-full"
              enterTo="opacity-100 translate-y-0"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-full"
            >
              <Dialog.Panel className="inline-block w-full h-[90vh] text-left align-bottom transition-all transform bg-white dark:bg-neutral-900 rounded-t-2xl shadow-xl">
                <div className="relative p-6 space-y-6">
                  {/* Header */}
                  <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-semibold">
                      Booking Details
                    </h3>
                    <button 
                      onClick={() => setIsOpen(false)}
                      className="p-2 hover:bg-neutral-100 rounded-full"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Participants Section */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Number of Participants
                    </label>
                    <ParticipantsInput
                      value={localParticipants}
                      onChange={setLocalParticipants}
                      placeholder="Select participants"
                      className="flex-1"
                    />
                  </div>

                  {/* Addons Section */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-neutral-800 dark:text-neutral-200">
                      Add-ons
                    </h4>
                    
                    {/* Recording Option */}
                    <div className="p-4 rounded-xl bg-neutral-800 space-y-3">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="includeRecording"
                          checked={includeRecording}
                          onChange={(e) => setIncludeRecording(e.target.checked)}
                          className="h-5 w-5 rounded bg-blue-500 border-transparent text-blue-500 focus:ring-blue-500"
                        />
                        <div className="flex flex-col">
                          <label htmlFor="includeRecording" className="text-sm font-medium text-white">
                            Session Recording
                          </label>
                          <span className="text-sm text-neutral-400">
                            €20 per recording
                          </span>
                        </div>
                      </div>

                      {/* Recording Count Input */}
                      {includeRecording && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-neutral-400">Recordings</span>
                            <div className="flex items-center space-x-2">
                              <button
                                type="button"
                                onClick={() => handleRecordingCountChange(recordingCount - 1)}
                                disabled={recordingCount <= 1}
                                className="rounded-full w-8 h-8 flex items-center justify-center bg-neutral-700 hover:bg-neutral-600 disabled:opacity-50 transition-colors"
                              >
                                <MinusIcon className="h-4 w-4 text-white" />
                              </button>
                              <span className="text-white w-4 text-center">{recordingCount}</span>
                              <button
                                type="button"
                                onClick={() => handleRecordingCountChange(recordingCount + 1)}
                                disabled={recordingCount >= localParticipants}
                                className="rounded-full w-8 h-8 flex items-center justify-center bg-neutral-700 hover:bg-neutral-600 disabled:opacity-50 transition-colors"
                              >
                                <PlusIcon className="h-4 w-4 text-white" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Price Summary */}
                  <div className="space-y-3 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800">
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-600 dark:text-neutral-400">
                        Base Price (€{basePrice} × {localParticipants} {localParticipants === 1 ? 'participant' : 'participants'})
                      </span>
                      <span className="font-medium">€{basePrice * localParticipants}</span>
                    </div>
                    {includeRecording && (
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-600 dark:text-neutral-400">
                          Recording (€{recordingPrice} × {recordingCount} {recordingCount === 1 ? 'access' : 'accesses'})
                        </span>
                        <span className="font-medium">€{recordingPrice * recordingCount}</span>
                      </div>
                    )}
                    <div className="border-t border-neutral-200 dark:border-neutral-700 pt-3">
                      <div className="flex justify-between font-semibold">
                        <span>Total</span>
                        <span>€{localTotal}</span>
                      </div>
                    </div>
                  </div>

                  {/* Book Now Button */}
                  <ButtonPrimary
                    onClick={handleCheckout}
                    className="w-full"
                  >
                    Book Now · €{localTotal}
                  </ButtonPrimary>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default MobileFooterSticky;
