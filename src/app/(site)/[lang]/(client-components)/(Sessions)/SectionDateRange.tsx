import React, { FC, useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import DatePickerCustomHeaderTwoMonth from "@/components/DatePickerCustomHeaderTwoMonth";
import DatePickerCustomDay from "@/components/DatePickerCustomDay";
import { SessionWithExpert } from "@/types/session";

interface UserBooking {
  id: string;
  title: string;
  date: string;
  startTime: string;
  duration: number;
  timeZone: string;
}

interface SectionDateRangeProps {
  session: SessionWithExpert;
}

const SectionDateRange: FC<SectionDateRangeProps> = ({ session }) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showPopover, setShowPopover] = useState(false);
  const [userBookings, setUserBookings] = useState<UserBooking[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  // Add window resize listener
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768); // 768px is typical tablet/mobile breakpoint
    };

    // Check initially
    checkIsMobile();

    // Add resize listener
    window.addEventListener('resize', checkIsMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Fetch user bookings
  useEffect(() => {
    const fetchUserBookings = async () => {
      try {
        const response = await fetch('/api/user/bookings');
        if (response.ok) {
          const data = await response.json();
          setUserBookings(data);
        }
      } catch (error) {
        console.error('Error fetching user bookings:', error);
      }
    };

    fetchUserBookings();
  }, []);

  // Check for time conflicts
  const hasTimeConflict = (date1: Date, duration1: number, date2: Date, duration2: number) => {
    const start1 = date1.getTime();
    const end1 = start1 + (duration1 * 60 * 60 * 1000);
    const start2 = date2.getTime();
    const end2 = start2 + (duration2 * 60 * 60 * 1000);

    return (start1 < end2) && (end1 > start2);
  };

  // Create events array combining current session and user bookings
  const events = [
    // Current session
    {
      id: session.id,
      date: new Date(session.date),
      title: session.title,
      status: "Current",
      startTime: new Date(session.startTime),
      duration: session.duration,
      timeZone: session.timeZone
    },
    // User bookings
    ...userBookings.map(booking => {
      const bookingStart = new Date(`${booking.date}T${booking.startTime}`);
      const sessionStart = new Date(session.startTime);
      
      const status = hasTimeConflict(
        bookingStart, 
        booking.duration,
        sessionStart,
        session.duration
      ) ? "Conflict" : "Booked";

      return {
        id: booking.id,
        date: new Date(booking.date),
        title: booking.title,
        status,
        startTime: bookingStart,
        duration: booking.duration,
        timeZone: booking.timeZone
      };
    })
  ];

  // Filter events for selected date
  const eventsForSelectedDate = events.filter(
    event => event.date.toDateString() === selectedDate?.toDateString()
  );

  // Get event type for a date
  const getEventType = (date: Date) => {
    const eventsOnDate = events.filter(
      event => event.date.toDateString() === date.toDateString()
    );
    
    if (eventsOnDate.length === 0) return null;
    if (eventsOnDate.some(e => e.status === "Conflict")) return "Conflict";
    if (eventsOnDate.some(e => e.status === "Current")) return "Current";
    return "Booked";
  };

  return (
    <div className="listingSection__wrap overflow-hidden">
      {/* Heading */}
      <div>
        <h2 className="text-2xl font-semibold">Check Event Availability</h2>
        <span className="block mt-2 text-neutral-500 dark:text-neutral-400">
        Select a date to view event details and check availability.
        </span>
      </div>
      <div className="w-14 border-b border-neutral-200 dark:border-neutral-700"></div>

      {/* Legend */}
      <div className="flex space-x-4 mt-4">
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
          <span className="text-sm text-neutral-600 dark:text-neutral-400">Current Session</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 bg-green-500 rounded-full"></span>
          <span className="text-sm text-neutral-600 dark:text-neutral-400">Your Bookings</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 bg-red-500 rounded-full"></span>
          <span className="text-sm text-neutral-600 dark:text-neutral-400">Conflicts</span>
        </div>
      </div>

      {/* Calendar */}
      <div className="mt-4">
        <DatePicker
          selected={selectedDate}
          onChange={(date) => {
            setSelectedDate(date);
            setShowPopover(!!date);
          }}
          monthsShown={isMobile ? 1 : 2}
          showPopperArrow={false}
          inline
          className="w-full"
          renderCustomHeader={(props) => (
            <DatePickerCustomHeaderTwoMonth 
              {...props}
              customHeaderCount={isMobile ? 0 : props.customHeaderCount}
            />
          )}
          renderDayContents={(day, date) => {
            const isSelected = selectedDate && date && 
              date.toDateString() === selectedDate.toDateString();
            const eventType = date ? getEventType(date) : null;

            let dayClass = "";
            if (isSelected) {
              dayClass = "bg-primary-500 text-white dark:bg-primary-700";
            } else if (eventType === "Current") {
              dayClass = "bg-blue-200 text-blue-800 dark:bg-blue-400";
            } else if (eventType === "Booked") {
              dayClass = "bg-green-200 text-green-800 dark:bg-green-400";
            } else if (eventType === "Conflict") {
              dayClass = "bg-red-200 text-red-800 dark:bg-red-400";
            }

            return (
              <DatePickerCustomDay
                dayOfMonth={day}
                date={date}
                className={dayClass}
              />
            );
          }}
          calendarClassName={`w-full ${isMobile ? 'single-month' : 'two-months'}`}
        />
      </div>

      {/* Event Details Popover */}
      {showPopover && selectedDate && (
        <div className="popover-container bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg mt-4">
          <h3 className="text-lg font-semibold">Events on {selectedDate.toLocaleDateString()}</h3>
          <div className="mt-4 space-y-4">
            {eventsForSelectedDate.map((event, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center space-x-3">
                  <span className={`w-2 h-2 rounded-full ${
                    event.status === "Current" ? "bg-blue-500" :
                    event.status === "Booked" ? "bg-green-500" : "bg-red-500"
                  }`}></span>
                  <span className="text-sm font-medium">{event.title}</span>
                  <span className="text-xs text-gray-500">({event.status})</span>
                </div>
                <div className="ml-5 text-xs text-gray-500 dark:text-gray-400">
                  <div>Time: {event.startTime.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  })} {event.timeZone}</div>
                  <div>Duration: {event.duration} {event.duration === 1 ? 'hour' : 'hours'}</div>
                </div>
              </div>
            ))}
            {eventsForSelectedDate.length === 0 && (
              <p className="text-sm text-gray-500">No events scheduled for this date</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Add some CSS to ensure proper mobile styling
const styles = `
  @media (max-width: 767px) {
    .react-datepicker {
      width: 100% !important;
    }
    .react-datepicker__month-container {
      width: 100% !important;
    }
    .react-datepicker__month {
      margin: 0 !important;
      padding: 0.5rem !important;
    }
    .react-datepicker__day {
      width: 2.5rem !important;
      line-height: 2.5rem !important;
      margin: 0.166rem !important;
    }
  }
`;

// Add the styles to the document
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default SectionDateRange;
