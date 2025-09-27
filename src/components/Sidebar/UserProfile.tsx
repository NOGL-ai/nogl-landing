'use client';

import React from 'react';
import Link from 'next/link';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { UserProfile as UserProfileType } from '@/types/navigation';

interface UserProfileProps {
  user: UserProfileType;
  isCollapsed: boolean;
  onLogout?: () => void;
}

const profileMenuItems = [
  {
    label: 'View Profile',
    href: '/profile',
    icon: (
      <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 17.5H14.5V16C14.5 15.4033 14.2629 14.831 13.841 14.409C13.419 13.9871 12.8467 13.75 12.25 13.75H7.75C7.15326 13.75 6.58097 13.9871 6.15901 14.409C5.73705 14.831 5.5 15.4033 5.5 16V17.5H4V16C4 15.0054 4.39509 14.0516 5.09835 13.3483C5.80161 12.6451 6.75544 12.25 7.75 12.25H12.25C13.2446 12.25 14.1984 12.6451 14.9017 13.3483C15.6049 14.0516 16 15.0054 16 16V17.5ZM10 10.75C9.40905 10.75 8.82389 10.6336 8.27792 10.4075C7.73196 10.1813 7.23588 9.84984 6.81802 9.43198C6.40016 9.01412 6.06869 8.51804 5.84254 7.97208C5.6164 7.42611 5.5 6.84095 5.5 6.25C5.5 5.65905 5.6164 5.07389 5.84254 4.52792C6.06869 3.98196 6.40016 3.48588 6.81802 3.06802C7.23588 2.65016 7.73196 2.31869 8.27792 2.09254C8.82389 1.8664 9.40905 1.75 10 1.75C11.1935 1.75 12.3381 2.22411 13.182 3.06802C14.0259 3.91193 14.5 5.05653 14.5 6.25C14.5 7.44347 14.0259 8.58807 13.182 9.43198C12.3381 10.2759 11.1935 10.75 10 10.75ZM10 9.25C10.7956 9.25 11.5587 8.93393 12.1213 8.37132C12.6839 7.80871 13 7.04565 13 6.25C13 5.45435 12.6839 4.69129 12.1213 4.12868C11.5587 3.56607 10.7956 3.25 10 3.25C9.20435 3.25 8.44129 3.56607 7.87868 4.12868C7.31607 4.69129 7 5.45435 7 6.25C7 7.04565 7.31607 7.80871 7.87868 8.37132C8.44129 8.93393 9.20435 9.25 10 9.25Z" fill="currentColor"/>
      </svg>
    ),
  },
  {
    label: 'Account Settings',
    href: '/account/settings',
    icon: (
      <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7.5145 4L9.46975 2.04475C9.6104 1.90415 9.80113 1.82516 10 1.82516C10.1989 1.82516 10.3896 1.90415 10.5303 2.04475L12.4855 4H15.25C15.4489 4 15.6397 4.07902 15.7803 4.21967C15.921 4.36033 16 4.55109 16 4.75V7.5145L17.9553 9.46975C18.0959 9.6104 18.1748 9.80113 18.1748 10C18.1748 10.1989 18.0959 10.3896 17.9553 10.5303L16 12.4855V15.25C16 15.4489 15.921 15.6397 15.7803 15.7803C15.6397 15.921 15.4489 16 15.25 16H12.4855L10.5303 17.9553C10.3896 18.0959 10.1989 18.1748 10 18.1748C9.80113 18.1748 9.6104 18.0959 9.46975 17.9553L7.5145 16H4.75C4.55109 16 4.36033 15.921 4.21967 15.7803C4.07902 15.6397 4 15.4489 4 15.25V12.4855L2.04475 10.5303C1.90415 10.3896 1.82516 10.1989 1.82516 10C1.82516 9.80113 1.90415 9.6104 2.04475 9.46975L4 7.5145V4.75C4 4.55109 4.07902 4.36033 4.21967 4.21967C4.36033 4.07902 4.55109 4 4.75 4H7.5145ZM5.5 5.5V8.13625L3.63625 10L5.5 11.8638V14.5H8.13625L10 16.3638L11.8638 14.5H14.5V11.8638L16.3638 10L14.5 8.13625V5.5H11.8638L10 3.63625L8.13625 5.5H5.5ZM10 13C9.20435 13 8.44129 12.6839 7.87868 12.1213C7.31607 11.5587 7 10.7957 7 10C7 9.20435 7.31607 8.44129 7.87868 7.87868C8.44129 7.31607 9.20435 7 10 7C10.7957 7 11.5587 7.31607 12.1213 7.87868C12.6839 8.44129 13 9.20435 13 10C13 10.7957 12.6839 11.5587 12.1213 12.1213C11.5587 12.6839 10.7957 13 10 13ZM10 11.5C10.3978 11.5 10.7794 11.342 11.0607 11.0607C11.342 10.7794 11.5 10.3978 11.5 10C11.5 9.60218 11.342 9.22065 11.0607 8.93934C10.7794 8.65804 10.3978 8.5 10 8.5C9.60218 8.5 9.22065 8.65804 8.93934 8.93934C8.65804 9.22065 8.5 9.60218 8.5 10C8.5 10.3978 8.65804 10.7794 8.93934 11.0607C9.22065 11.342 9.60218 11.5 10 11.5Z" fill="currentColor"/>
      </svg>
    ),
  },
  {
    label: 'Notifications',
    href: '/notifications',
    icon: (
      <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 1.25C6.54822 1.25 3.75 4.04822 3.75 7.5V8.20413C3.75 8.90099 3.54365 9.58245 3.15702 10.1622L2.00856 11.8851C0.675469 13.8848 1.69318 16.6028 4.01177 17.2351C4.76738 17.4412 5.52937 17.6155 6.29578 17.7581L6.29768 17.7632C7.06667 19.8151 9.12198 21.25 11.5 21.25C13.878 21.25 15.9333 19.8151 16.7023 17.7632L16.7042 17.7581C17.4706 17.6155 18.2327 17.4412 18.9883 17.2351C21.3069 16.6028 22.3246 13.8848 20.9915 11.8851L19.8429 10.1622C19.4563 9.58245 19.25 8.90099 19.25 8.20413V7.5C19.25 4.04822 16.4518 1.25 11.5 1.25ZM14.8764 17.787C12.6335 18.055 10.3664 18.0549 8.12349 17.7869C8.83444 18.8085 10.071 19.5 11.5 19.5C12.9289 19.5 14.1655 18.8085 14.8764 17.787ZM5.25 7.5C5.25 4.87665 7.37665 2.75 10 2.75C12.6234 2.75 14.75 4.87665 14.75 7.5V8.20413C14.75 9.19719 15.044 10.168 15.5948 10.9943L16.7434 12.7172C17.5086 13.8649 16.9245 15.425 15.5936 15.788C11.9494 17.0546 8.05063 17.0546 4.40644 15.788C3.07561 15.425 2.49147 13.8649 3.25664 12.7172L4.40524 10.9943C4.95609 10.168 5.25 9.19719 5.25 8.20413V7.5Z" fill="currentColor"/>
      </svg>
    ),
  },
];

const UserProfile: React.FC<UserProfileProps> = ({ user, isCollapsed, onLogout }) => {
  if (isCollapsed) {
    // Collapsed state - show only avatar
    return (
      <div className="border-t border-[#E2E4E9]/20">
        <div className="p-3 flex justify-center">
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center">
              <div className="w-10 h-10 rounded-full overflow-hidden">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </Menu.Button>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                <div className="py-1">
                  {profileMenuItems.map((item) => (
                    <Menu.Item key={item.href}>
                      {({ active }) => (
                        <Link
                          href={item.href}
                          className={`${
                            active ? 'bg-gray-100 dark:bg-gray-700' : ''
                          } flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200`}
                        >
                          <span className="mr-3">{item.icon}</span>
                          {item.label}
                        </Link>
                      )}
                    </Menu.Item>
                  ))}
                  <div className="border-t border-gray-100 dark:border-gray-700">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={onLogout}
                          className={`${
                            active ? 'bg-gray-100 dark:bg-gray-700' : ''
                          } flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400`}
                        >
                          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-3">
                            <path d="M4.75 17.5C4.55109 17.5 4.36032 17.421 4.21967 17.2803C4.07902 17.1397 4 16.9489 4 16.75V3.25C4 3.05109 4.07902 2.86032 4.21967 2.71967C4.36032 2.57902 4.55109 2.5 4.75 2.5H15.25C15.4489 2.5 15.6397 2.57902 15.7803 2.71967C15.921 2.86032 16 3.05109 16 3.25V5.5H14.5V4H5.5V16H14.5V14.5H16V16.75C16 16.9489 15.921 17.1397 15.7803 17.2803C15.6397 17.421 15.4489 17.5 15.25 17.5H4.75ZM14.5 13V10.75H9.25V9.25H14.5V7L18.25 10L14.5 13Z" fill="currentColor"/>
                          </svg>
                          Sign out
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    );
  }

  // Expanded state - show full profile with dropdown
  return (
    <div className="border-t border-[#E2E4E9]/20">
      <div className="p-3">
        <Menu as="div" className="relative">
          <Menu.Button className="flex items-center gap-3 p-3 rounded-[10px] w-full hover:bg-white/5 transition-colors">
            {/* Avatar */}
            <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* User info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col gap-1">
                <h4 className="text-white font-inter text-[14px] font-medium leading-5 tracking-[-0.084px] truncate">
                  {user.name}
                </h4>
                <p className="text-[#9293A9] font-inter text-[12px] font-normal leading-4 truncate">
                  {user.email}
                </p>
              </div>
            </div>

            {/* Dropdown arrow */}
            <div className="flex-shrink-0">
              <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg" className="transform rotate-90">
                <path d="M6.00539 8.49929L13.4583 8.49929M9.08933 11.5725L6.0051 8.4983L9.08933 5.42733" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3.54167 4.77157L3.54167 12.2272" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </Menu.Button>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute bottom-full left-3 right-3 mb-2 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
              <div className="py-1">
                {profileMenuItems.map((item) => (
                  <Menu.Item key={item.href}>
                    {({ active }) => (
                      <Link
                        href={item.href}
                        className={`${
                          active ? 'bg-gray-100 dark:bg-gray-700' : ''
                        } flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200`}
                      >
                        <span className="mr-3">{item.icon}</span>
                        {item.label}
                      </Link>
                    )}
                  </Menu.Item>
                ))}
                <div className="border-t border-gray-100 dark:border-gray-700">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={onLogout}
                        className={`${
                          active ? 'bg-gray-100 dark:bg-gray-700' : ''
                        } flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400`}
                      >
                        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-3">
                          <path d="M4.75 17.5C4.55109 17.5 4.36032 17.421 4.21967 17.2803C4.07902 17.1397 4 16.9489 4 16.75V3.25C4 3.05109 4.07902 2.86032 4.21967 2.71967C4.36032 2.57902 4.55109 2.5 4.75 2.5H15.25C15.4489 2.5 15.6397 2.57902 15.7803 2.71967C15.921 2.86032 16 3.05109 16 3.25V5.5H14.5V4H5.5V16H14.5V14.5H16V16.75C16 16.9489 15.921 17.1397 15.7803 17.2803C15.6397 17.421 15.4489 17.5 15.25 17.5H4.75ZM14.5 13V10.75H9.25V9.25H14.5V7L18.25 10L14.5 13Z" fill="currentColor"/>
                        </svg>
                        Sign out
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </div>
  );
};

export default UserProfile;
