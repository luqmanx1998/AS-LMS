import { useState } from "react";
import { daysOfTheWeek, getDays, months } from "../functions/getDays";
import dayjs from "dayjs";

function Calendar() {
  const currentDate = dayjs();

  const [today, setToday] = useState(currentDate);

  function getDayClass(currentMonth, isCurrentMonth, isToday) {
    if (isToday) {
      return "bg-[#EDCEAF] text-black font-semibold"; // today highlight (beige)
    }
    if (!isCurrentMonth) {
      return "text-[#B0B0B0]"; // greyed-out for prev/next month days
    }
    return "text-black"; // default for current month days
  }

  return (
    <div className="rounded-2xl border-[#DFE4EA] border-[1px] px-4 py-4 mb-4">
      <h2 className="subheading-custom-2 pb-4">Leave Calendar</h2>
      <div className="rounded-2xl border-[#DFE4EA] border-[1px] px-4 py-4 flex-col justify-between items-center">
        <div className="flex items-center justify-between mb-4">
        <h1 className="body-1">
          {months[today.month()]}, {today.year()}
        </h1>
        <div className="flex gap-1">
          <div
            className="p-1 border-[1px] border-[#DFE4EA] rounded-md cursor-pointer"
            onClick={() => setToday(dayjs(today).month(today.month() - 1))}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="lucide lucide-chevron-left-icon lucide-chevron-left"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </div>
          <div
            className="p-1 border-[1px] border-[#DFE4EA] rounded-md cursor-pointer"
            onClick={() => setToday(dayjs(today).month(today.month() + 1))}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="lucide lucide-chevron-right-icon lucide-chevron-right"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </div>
        </div>
        </div>
        <div className="grid grid-cols-7 bg-[#EBF1FF] rounded-t-xl">
        {daysOfTheWeek.map((day, index) => {
          return (
            <h1
              key={index}
              className="h-10 font-semibold grid place-content-center text-sm text-gray-700"
            >
              {day}
            </h1>
          );
        })}
      </div>
      <div className="grid grid-cols-7">
        {getDays(today.month(), today.year()).map(
          ({ date, currentMonth, today: isToday }, index) => {
            return (
              <div
                key={index}
                className={`h-10 grid place-content-center ${getDayClass(
                  today.month(),
                  currentMonth,
                  isToday
                )} border-[1px] border-[#ebeef1]`}
              >
                <h1>{date.date()}</h1>
              </div>
            );
          }
        )}
      </div>
      </div>
    </div>
  );
}

export default Calendar;
