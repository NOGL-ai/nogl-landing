// COMMENTED OUT - Account Savelists page disabled for build optimization
// "use client";

// import { Tab } from "@headlessui/react";
// import StayCard2 from "@/components/StayCard2"; // Reusing StayCard2 for sessions
// import { DEMO_SESSIONS_LISTINGS } from "@/data/listings";
// import React, { Fragment, useState } from "react";
// import ButtonSecondary from "@/shared/ButtonSecondary";

// COMMENTED OUT - Account Savelists component disabled for build optimization
/*
const Session = () => {
  const [categories] = useState(["Sessions"]);

  const renderSection = () => {
    return (
      <div className="space-y-6 sm:space-y-8">
        <div>
          <h2 className="text-3xl font-semibold">Wishlists</h2>
        </div>
        <div className="w-14 border-b border-neutral-200 dark:border-neutral-700"></div>

        <div>
          <Tab.Group>
            <Tab.List className="flex space-x-1 overflow-x-auto">
              {categories.map((item) => (
                <Tab key={item} as={Fragment}>
                  {({ selected }) => (
                    <button
                      className={`flex-shrink-0 block !leading-none font-medium px-5 py-2.5 text-sm sm:text-base sm:px-6 sm:py-3 capitalize rounded-full focus:outline-none ${
                        selected
                          ? "bg-secondary-900 text-secondary-50 "
                          : "text-neutral-500 dark:text-neutral-400 dark:hover:text-neutral-100 hover:text-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      } `}
                    >
                      {item}
                    </button>
                  )}
                </Tab>
              ))}
            </Tab.List>
            <Tab.Panels>
              <Tab.Panel className="mt-8">
                <div className="grid grid-cols-1 gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {DEMO_SESSIONS_LISTINGS.slice(0, 8).map((session) => (
                    <StayCard2 key={session.id} data={session} />
                  ))}
                </div>
                <div className="flex mt-11 justify-center items-center">
                  <ButtonSecondary>Show me more</ButtonSecondary>
                </div>
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div>
      </div>
    );
  };

  return renderSection();
};
*/

// Placeholder component to prevent build errors
const Session = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Account Savelists Temporarily Unavailable
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          This feature has been temporarily disabled for build optimization.
        </p>
      </div>
    </div>
  );
};

export default Session;
