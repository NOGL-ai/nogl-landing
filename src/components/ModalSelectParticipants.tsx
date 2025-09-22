"use client";

import React, { FC, Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import ButtonPrimary from "@/shared/ButtonPrimary";

type UpsellingOption = "recording" | "aiChat";

interface ModalSelectParticipantsProps {
    renderChildren?: (p: { openModal: () => void }) => React.ReactNode;
}

const ModalSelectParticipants: FC<ModalSelectParticipantsProps> = ({ renderChildren }) => {
    const [showModal, setShowModal] = useState(false);
    const [isBookingSaved, setIsBookingSaved] = useState(false);
    const [upsellingOptions, setUpsellingOptions] = useState<Record<UpsellingOption, boolean>>({
        recording: false,
        aiChat: false,
    });

    // Toggle specific upselling option
    const toggleUpsellingOption = (option: UpsellingOption) => {
        setUpsellingOptions((prev) => ({
            ...prev,
            [option]: !prev[option],
        }));
    };

    // Clear all upselling options
    const clearOptions = () => {
        setUpsellingOptions({
            recording: false,
            aiChat: false,
        });
    };

    // Handle modal state changes
    const closeModal = () => setShowModal(false);
    const openModal = () => setShowModal(true);

    // Save booking and close modal
    const handleSave = () => {
        setIsBookingSaved(true);
        closeModal();
    };

    // Render button to open modal, dynamically adjusts label based on booking state
    const renderButtonOpenModal = () =>
        renderChildren ? (
            renderChildren({ openModal })
        ) : (
            <button onClick={openModal}>
                {isBookingSaved ? "Update Booking" : "Book Now"}
            </button>
        );

    return (
        <>
            {renderButtonOpenModal()}
            <Transition appear show={showModal} as={Fragment}>
                <Dialog
                    as="div"
                    className="ModalSelectParticipants__Dialog relative z-50"
                    onClose={closeModal}
                >
                    <div className="fixed inset-0 bg-neutral-100 dark:bg-neutral-900">
                        <div className="flex h-full">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out transition-transform"
                                enterFrom="opacity-0 translate-y-52"
                                enterTo="opacity-100 translate-y-0"
                                leave="ease-in transition-transform"
                                leaveFrom="opacity-100 translate-y-0"
                                leaveTo="opacity-0 translate-y-52"
                            >
                                <Dialog.Panel className="relative flex h-full flex-1 flex-col justify-between overflow-hidden">
                                    {/* Close Icon */}
                                    <div className="absolute left-4 top-4">
                                        <button className="focus:outline-none" onClick={closeModal}>
                                            <XMarkIcon className="h-5 w-5 text-black dark:text-white" />
                                        </button>
                                    </div>

                                    {/* Modal Content */}
                                    <div className="flex flex-1 flex-col p-1 pt-12 bg-white dark:bg-neutral-800">
                                        <div className="flex flex-1 flex-col space-y-4 p-4">
                                            {/* Upselling Options */}
                                            <label className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    checked={upsellingOptions.recording}
                                                    onChange={() => toggleUpsellingOption("recording")}
                                                    className="form-checkbox h-5 w-5 text-blue-600"
                                                />
                                                <span className="text-gray-700">Add Recording ($20)</span>
                                            </label>
                                            <label className="flex items-center space-x-3">
                                                <input
                                                    type="checkbox"
                                                    checked={upsellingOptions.aiChat}
                                                    onChange={() => toggleUpsellingOption("aiChat")}
                                                    className="form-checkbox h-5 w-5 text-blue-600"
                                                />
                                                <span className="text-gray-700">AI Chat Assistance ($10)</span>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Footer with Clear and Save Buttons */}
                                    <div className="flex justify-between border-t bg-white px-4 py-3 dark:border-neutral-700 dark:bg-neutral-900">
                                        <button
                                            type="button"
                                            className="font-semibold underline"
                                            onClick={clearOptions}
                                        >
                                            Clear options
                                        </button>
                                        <ButtonPrimary
                                            sizeClass="px-6 py-3 !rounded-xl"
                                            onClick={handleSave}
                                        >
                                            {isBookingSaved ? "Update Booking" : "Save Booking"}
                                        </ButtonPrimary>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </>
    );
};

export default ModalSelectParticipants;
