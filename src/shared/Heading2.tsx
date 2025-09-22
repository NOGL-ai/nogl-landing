import React from "react";
import { ReactNode } from "react";

export interface Heading2Props {
  heading?: ReactNode;
  subHeading?: ReactNode;
  className?: string;
  totalSessions?: number;  // Total number of sessions available
  dateRange?: string;      // The date range for the sessions
  participants?: number;   // Number of participants or spots available
  filtersApplied?: boolean; // Whether filters are applied
}

const Heading2: React.FC<Heading2Props> = ({
  className = "",
  heading = "Fashion Trend Forecasts",
  subHeading,
  totalSessions = 0,
  dateRange = "Upcoming dates",
  participants = 0,
  filtersApplied = true, // Default to true, meaning filters are applied
}) => {
  return (
    <div className={`mb-12 lg:mb-16 ${className}`}>
      <h2 className='text-4xl font-semibold'>{heading}</h2>
      {subHeading ? (
        subHeading
      ) : (
        <span className='mt-3 block text-neutral-500 dark:text-neutral-400'>
          {filtersApplied ? (
            <>
              {totalSessions} forecasts available
              <span className='mx-2'>·</span>
              {dateRange}
              <span className='mx-2'>·</span>
              {participants} Participants
            </>
          ) : (
            <>
              Showing all available forecasts
              <span className='mx-2'>·</span>
              {dateRange}
            </>
          )}
        </span>
      )}
    </div>
  );
};

export default Heading2;