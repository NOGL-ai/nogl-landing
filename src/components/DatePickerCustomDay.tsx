import React, { FC } from "react";

interface Props {
  dayOfMonth: number;
  date?: Date;
  className?: string;
}

const DatePickerCustomDay: FC<Props> = ({ dayOfMonth, date, className }) => {
  return <span className={`react-datepicker__day_span ${className}`}>{dayOfMonth}</span>;
};

export default DatePickerCustomDay;
