'use client'

import { Fragment, useState } from 'react'
import {
	Dialog,
	DialogTitle,
	Popover,
	PopoverButton,
	PopoverPanel,
	Transition,
	TransitionChild,
} from '@headlessui/react'
import NcInputNumber from '@/components/NcInputNumber'
import ButtonPrimary from '@/shared/ButtonPrimary'
import ButtonThird from '@/shared/ButtonThird'
import ButtonClose from '@/shared/ButtonClose'
import Checkbox from '@/shared/Checkbox'
import convertNumbThousand from '@/utils/convertNumbThousand'

// DEMO DATA
const typeOfPaces = [
  {
    name: 'SEO Marketing',
    description: 'Learn to optimize your website for search engines and increase visibility.',
  },
  {
    name: 'Content Strategy',
    description: 'Develop effective content plans to engage your audience and drive traffic.',
  },
  {
    name: 'Social Media Management',
    description: 'Master social media platforms to build your brand and connect with your audience.',
  },
  {
    name: 'Data Analysis',
    description: 'Analyze data to uncover insights and inform decision-making.',
  },
  {
    name: 'Web Development',
    description: 'Learn to build and maintain websites using modern tools and frameworks.',
  },
  {
    name: 'Project Management',
    description: 'Manage projects efficiently using proven methodologies and tools.',
  },
  {
    name: 'Graphic Design',
    description: 'Create visually appealing designs using software like Photoshop and Illustrator.',
  },
  {
    name: 'Copywriting',
    description: 'Craft compelling copy that resonates with your target audience.',
  },
  {
    name: 'Product Management',
    description: 'Oversee product development from ideation to launch.',
  },
  {
    name: 'Sales Techniques',
    description: 'Master techniques to close deals and increase revenue.',
  },
  {
    name: 'Customer Service',
    description: 'Provide exceptional support to enhance customer satisfaction.',
  },
  {
    name: 'Business Development',
    description: 'Identify opportunities and build strategies for business growth.',
  },
  {
    name: 'Leadership',
    description: 'Develop leadership skills to effectively manage and inspire teams.',
  },
  {
    name: 'Public Speaking',
    description: 'Improve your public speaking skills to engage and persuade your audience.',
  },
]

const moreFilter1 = [
  { name: 'Beginner' },
  { name: 'Intermediate' },
  { name: 'Advanced' },
  { name: 'Expert', defaultChecked: true }, // Marked as default checked
]

const moreFilter2 = [
  { name: 'Session Recording', defaultChecked: true },
  { name: '1-on-1 Consultation', defaultChecked: true },
  { name: 'AI-Powered Session Notes' },
  { name: 'Extended Q&A Time' },
  { name: 'Post-Session Materials' },
  { name: 'Certificate of Achievement' },
  { name: 'Exclusive Community Access' },
  { name: 'Follow-up Email Support' },
  { name: 'Group Discount' },
  { name: 'Priority Booking for Next Session' },
]

const moreFilter3 = [
	{ name: 'One-on-One Session', defaultChecked: true },
	{ name: 'Group Session' },
	{ name: 'Workshop' },
	{ name: 'Webinar' },
	{ name: 'Q&A Session' },
]

const moreFilter4 = [
    { name: 'English', defaultChecked: true },
    { name: 'German', defaultChecked: false },
]

const sessionDurations = [
  { name: '1 hour', value: 60 },
  { name: '2 hours', value: 120 },
  { name: '6 hours', value: 360 },
]

const TabFilters = () => {
	const [isOpenMoreFilter, setisOpenMoreFilter] = useState(false)
	const [isOpenMoreFilterMobile, setisOpenMoreFilterMobile] = useState(false)
	const [selectedDurations, setSelectedDurations] = useState<number[]>([]);

	//
	const closeModalMoreFilter = () => setisOpenMoreFilter(false)
	const openModalMoreFilter = () => setisOpenMoreFilter(true)
	//
	const closeModalMoreFilterMobile = () => setisOpenMoreFilterMobile(false)
	const openModalMoreFilterMobile = () => setisOpenMoreFilterMobile(true)

	const handleCheckboxChange = (value: number) => {
		setSelectedDurations((prevSelected) => {
		  if (prevSelected.includes(value)) {
			// If value is already selected, remove it
			return prevSelected.filter((duration) => duration !== value);
		  } else {
			// Otherwise, add it to the selection
			return [...prevSelected, value];
		  }
		})
	  }

	const renderXClear = () => {
		return (
			<span className="ml-3 flex h-4 w-4 cursor-pointer items-center justify-center rounded-full bg-primary-500 text-white">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					className="h-3 w-3"
					viewBox="0 0 20 20"
					fill="currentColor"
				>
					<path
						fillRule="evenodd"
						d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
						clipRule="evenodd"
					/>
				</svg>
			</span>
		)
	}

	const renderTabsTypeOfPlace = () => {
		return (
			<Popover className="relative">
				{({ open, close }) => (
					<>
						<PopoverButton
							className={`flex items-center justify-center rounded-full border border-neutral-300 px-4 py-2 text-sm hover:border-neutral-400 focus:outline-none dark:border-neutral-700 dark:hover:border-neutral-6000 ${
								open ? '!border-primary-500' : ''
							}`}
						>
							<span>Topics</span>
							<i className="las la-angle-down ml-2"></i>
						</PopoverButton>
						<Transition
							as={Fragment}
							enter="transition ease-out duration-200"
							enterFrom="opacity-0 translate-y-1"
							enterTo="opacity-100 translate-y-0"
							leave="transition ease-in duration-150"
							leaveFrom="opacity-100 translate-y-0"
							leaveTo="opacity-0 translate-y-1"
						>
							<PopoverPanel className="absolute left-0 z-10 mt-3 w-screen max-w-sm px-4 sm:px-0 lg:max-w-md">
								<div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-700 dark:bg-neutral-900">
									<div className="relative flex flex-col space-y-5 px-5 py-6">
										{typeOfPaces.map((item) => (
											<div key={item.name} className="">
												<Checkbox
													name={item.name}
													label={item.name}
													subLabel={item.description}
												/>
											</div>
										))}
									</div>
									<div className="flex items-center justify-between bg-neutral-50 p-5 dark:border-t dark:border-neutral-800 dark:bg-neutral-900">
										<ButtonThird onClick={close} sizeClass="px-4 py-2 sm:px-5">
											Clear
										</ButtonThird>
										<ButtonPrimary
											onClick={close}
											sizeClass="px-4 py-2 sm:px-5"
										>
											Apply
										</ButtonPrimary>
									</div>
								</div>
							</PopoverPanel>
						</Transition>
					</>
				)}
			</Popover>
		)
	}
	
	const renderTabsSessionDuration = () => {
		return (
		  <Popover className="relative">
			{({ open, close }) => (
			  <>
				<PopoverButton
				  className={`flex items-center justify-center rounded-full border border-primary-500 bg-primary-50 px-4 py-2 text-sm text-primary-700 focus:outline-none`}
				>
				  <span>
					{selectedDurations.length > 0
					  ? selectedDurations.map((dur) => `${dur / 60} hr`).join(', ')
					  : 'Select Duration'}
				  </span>
				  {selectedDurations.length > 0 && renderXClear()}
				</PopoverButton>
				<Transition
				  as={Fragment}
				  enter="transition ease-out duration-200"
				  enterFrom="opacity-0 translate-y-1"
				  enterTo="opacity-100 translate-y-0"
				  leave="transition ease-in duration-150"
				  leaveFrom="opacity-100 translate-y-0"
				  leaveTo="opacity-0 translate-y-1"
				>
				  <PopoverPanel className="absolute left-0 z-10 mt-3 w-screen max-w-sm px-4 sm:px-0">
					<div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-700 dark:bg-neutral-900">
					  <div className="relative flex flex-col space-y-8 px-5 py-6">
						<div className="space-y-5">
						  {sessionDurations.map(({ name, value }) => (
							<Checkbox
							  key={value}
							  name={name}
							  label={name}
							  checked={selectedDurations.includes(value)}
							  onChange={() => handleCheckboxChange(value)}
							/>
						  ))}
						</div>
					  </div>
					  <div className="flex items-center justify-between bg-neutral-50 p-5 dark:border-t dark:border-neutral-800 dark:bg-neutral-900">
						<ButtonThird
						  onClick={() => {
							setSelectedDurations([]);
							close();
						  }}
						  sizeClass="px-4 py-2 sm:px-5"
						>
						  Clear
						</ButtonThird>
						<ButtonPrimary onClick={close} sizeClass="px-4 py-2 sm:px-5">
						  Apply
						</ButtonPrimary>
					  </div>
					</div>
				  </PopoverPanel>
				</Transition>
			  </>
			)}
		  </Popover>
		)
	  }

	const renderMoreFilterItem = (
		data: {
			name: string
			defaultChecked?: boolean
		}[],
	) => {
		const list1 = data.filter((_, i) => i < data.length / 2)
		const list2 = data.filter((_, i) => i >= data.length / 2)
		return (
			<div className="grid grid-cols-2 gap-8">
				<div className="flex flex-col space-y-5">
					{list1.map((item) => (
						<Checkbox
							key={item.name}
							name={item.name}
							label={item.name}
							defaultChecked={!!item.defaultChecked}
						/>
					))}
				</div>
				<div className="flex flex-col space-y-5">
					{list2.map((item) => (
						<Checkbox
							key={item.name}
							name={item.name}
							label={item.name}
							defaultChecked={!!item.defaultChecked}
						/>
					))}
				</div>
			</div>
		)
	}

	const renderTabMoreFilter = () => {
		return (
			<div>
				<div
					className={`flex cursor-pointer items-center justify-center rounded-full border border-primary-500 bg-primary-50 px-4 py-2 text-sm text-primary-700 focus:outline-none`}
					onClick={openModalMoreFilter}
				>
					<span>More filters (3)</span>
					{renderXClear()}
				</div>

				<Transition appear show={isOpenMoreFilter} as={Fragment}>
					<Dialog
						as="div"
						className="fixed inset-0 z-50 overflow-y-auto"
						onClose={closeModalMoreFilter}
					>
						<div className="min-h-screen text-center">
							<TransitionChild
								as={Fragment}
								enter="ease-out duration-300"
								enterFrom="opacity-0"
								enterTo="opacity-100"
								leave="ease-in duration-200"
								leaveFrom="opacity-100"
								leaveTo="opacity-0"
							>
								<div className="fixed inset-0 bg-black bg-opacity-40 dark:bg-opacity-60" />
							</TransitionChild>

							{/* This element is to trick the browser into centering the modal contents. */}
							<span
								className="inline-block h-screen align-middle"
								aria-hidden="true"
							>
								&#8203;
							</span>
							<TransitionChild
								as={'div'}
								className="inline-block h-screen w-full max-w-4xl px-2 py-8"
								enter="ease-out duration-300"
								enterFrom="opacity-0 scale-95"
								enterTo="opacity-100 scale-100"
								leave="ease-in duration-200"
								leaveFrom="opacity-100 scale-100"
								leaveTo="opacity-0 scale-95"
							>
								<div className="inline-flex h-full w-full max-w-4xl transform flex-col overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all dark:border dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100">
									<div className="relative flex-shrink-0 border-b border-neutral-200 px-6 py-4 text-center dark:border-neutral-800">
										<DialogTitle
											as="h3"
											className="text-lg font-medium leading-6 text-gray-900"
										>
											More filters
										</DialogTitle>
										<span className="absolute left-3 top-3">
											<ButtonClose onClick={closeModalMoreFilter} />
										</span>
									</div>

									<div className="flex-grow overflow-y-auto">
										<div className="divide-y divide-neutral-200 px-10 dark:divide-neutral-800">
											<div className="py-7">
												<h3 className="text-xl font-medium">Level</h3>
												<div className="relative mt-6">
													{renderMoreFilterItem(moreFilter1)}
												</div>
											</div>
											<div className="py-7">
												<h3 className="text-xl font-medium">Enhance Your Session</h3>
												<div className="relative mt-6">
													{renderMoreFilterItem(moreFilter2)}
												</div>
											</div>
											<div className="py-7">
												<h3 className="text-xl font-medium">Session type</h3>
												<div className="relative mt-6">
													{renderMoreFilterItem(moreFilter3)}
												</div>
											</div>
											<div className="py-7">
												<h3 className="text-xl font-medium">Language preferences</h3>
												<div className="relative mt-6">
													{renderMoreFilterItem(moreFilter4)}
												</div>
											</div>
										</div>
									</div>

									<div className="flex flex-shrink-0 items-center justify-between bg-neutral-50 p-6 dark:border-t dark:border-neutral-800 dark:bg-neutral-900">
										<ButtonThird
											onClick={closeModalMoreFilter}
											sizeClass="px-4 py-2 sm:px-5"
										>
											Clear
										</ButtonThird>
										<ButtonPrimary
											onClick={closeModalMoreFilter}
											sizeClass="px-4 py-2 sm:px-5"
										>
											Apply
										</ButtonPrimary>
									</div>
								</div>
							</TransitionChild>
						</div>
					</Dialog>
				</Transition>
			</div>
		)
	}

	const renderTabMoreFilterMobile = () => {
		return (
			<div>
				<div
					className={`flex cursor-pointer items-center justify-center rounded-full border border-primary-500 bg-primary-50 px-4 py-2 text-sm text-primary-700 focus:outline-none lg:hidden`}
					onClick={openModalMoreFilterMobile}
				>
					<span>More filters (3)</span>
					{renderXClear()}
				</div>

				<Transition appear show={isOpenMoreFilterMobile} as={Fragment}>
					<Dialog
						as="div"
						className="fixed inset-0 z-50 overflow-y-auto"
						onClose={closeModalMoreFilterMobile}
					>
						<div className="min-h-screen text-center">
							<TransitionChild
								as={Fragment}
								enter="ease-out duration-300"
								enterFrom="opacity-0"
								enterTo="opacity-100"
								leave="ease-in duration-200"
								leaveFrom="opacity-100"
								leaveTo="opacity-0"
							>
								<div className="fixed inset-0 bg-black bg-opacity-40 dark:bg-opacity-60" />
							</TransitionChild>

							{/* This element is to trick the browser into centering the modal contents. */}
							<span
								className="inline-block h-screen align-middle"
								aria-hidden="true"
							>
								&#8203;
							</span>
							<TransitionChild
								as={'div'}
								className="inline-block h-screen w-full max-w-4xl px-2 py-8"
								enter="ease-out duration-300"
								enterFrom="opacity-0 scale-95"
								enterTo="opacity-100 scale-100"
								leave="ease-in duration-200"
								leaveFrom="opacity-100 scale-100"
								leaveTo="opacity-0 scale-95"
							>
								<div className="inline-flex h-full w-full max-w-4xl transform flex-col overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all dark:border dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100">
									<div className="relative flex-shrink-0 border-b border-neutral-200 px-6 py-4 text-center dark:border-neutral-800">
										<DialogTitle
											as="h3"
											className="text-lg font-medium leading-6 text-gray-900"
										>
											More filters
										</DialogTitle>
										<span className="absolute left-3 top-3">
											<ButtonClose onClick={closeModalMoreFilterMobile} />
										</span>
									</div>

									<div className="flex-grow overflow-y-auto">
										<div className="divide-y divide-neutral-200 px-4 dark:divide-neutral-800 sm:px-6">
											{/* ---- */}
											<div className="py-7">
												<h3 className="text-xl font-medium">Topics</h3>
												<div className="relative mt-6">
													{renderMoreFilterItem(typeOfPaces)}
												</div>
											</div>

											{/* ---- */}

											<div className="py-7">
												<h3 className="text-xl font-medium">Session Duration</h3>
												<div className="relative mt-6 flex flex-col space-y-8">
													<div className="space-y-5">
														{sessionDurations.map(({ name, value }) => (
															<Checkbox
																key={value}
																name={name}
																label={name}
																checked={selectedDurations.includes(value)}
																onChange={() => handleCheckboxChange(value)}
															/>
														))}
													</div>
												</div>
											</div>

											{/* ---- */}
											<div className="py-7">
												<h3 className="text-xl font-medium">Level</h3>
												<div className="relative mt-6">
													{renderMoreFilterItem(moreFilter1)}
												</div>
											</div>

											{/* ---- */}
											<div className="py-7">
												<h3 className="text-xl font-medium">Enhance Your Session</h3>
												<div className="relative mt-6">
													{renderMoreFilterItem(moreFilter2)}
												</div>
											</div>

											{/* ---- */}
											<div className="py-7">
												<h3 className="text-xl font-medium">Session type</h3>
												<div className="relative mt-6">
													{renderMoreFilterItem(moreFilter3)}
												</div>
											</div>

											{/* ---- */}
											<div className="py-7">
												<h3 className="text-xl font-medium">Language preferences</h3>
												<div className="relative mt-6">
													{renderMoreFilterItem(moreFilter4)}
												</div>
											</div>
										</div>
									</div>

									<div className="flex flex-shrink-0 items-center justify-between bg-neutral-50 p-4 dark:border-t dark:border-neutral-800 dark:bg-neutral-900 sm:p-6">
										<ButtonThird
											onClick={closeModalMoreFilterMobile}
											sizeClass="px-4 py-2 sm:px-5"
										>
											Clear
										</ButtonThird>
										<ButtonPrimary
											onClick={closeModalMoreFilterMobile}
											sizeClass="px-4 py-2 sm:px-5"
										>
											Apply
										</ButtonPrimary>
									</div>
								</div>
							</TransitionChild>
						</div>
					</Dialog>
				</Transition>
			</div>
		)
	}

	return (
		<div className="flex lg:space-x-4">
			<div className="hidden space-x-4 lg:flex">
				{renderTabsTypeOfPlace()}
				{renderTabsSessionDuration()}
				{renderTabMoreFilter()}
			</div>
			{renderTabMoreFilterMobile()}
		</div>
	)
}

export default TabFilters
