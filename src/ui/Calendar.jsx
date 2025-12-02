import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { daysOfTheWeek, getDays, months } from "../functions/getDays";
import { getLeaveData } from "../functions/getLeaveData";
import Portal from "./Portal";

function Calendar() {
  const currentDate = dayjs();
  const [today, setToday] = useState(currentDate);
  const [selectedDate, setSelectedDate] = useState(null);

  const { data: leavesResponse = [], isLoading } = useQuery({
    queryKey: ["leaves"],
    queryFn: () => getLeaveData(),
    staleTime: 5 * 60 * 1000,
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const leaves = Array.isArray(leavesResponse)
    ? leavesResponse
    : leavesResponse?.leaves || [];

  const leaveMap = useMemo(() => {
    const map = {};
    if (!leaves?.length) return map;

    leaves.forEach((leave) => {
      const start = dayjs(leave.start_date);
      const end = dayjs(leave.end_date);
      for (
        let d = start;
        d.isBefore(end) || d.isSame(end, "day");
        d = d.add(1, "day")
      ) {
        const key = d.format("YYYY-MM-DD");
        if (!map[key]) map[key] = [];
        map[key].push(leave);
      }
    });

    return map;
  }, [leaves]);

  function getDayClass(currentMonth, isCurrentMonth, isToday) {
    if (isToday) return "bg-[#EDCEAF] text-black font-semibold";
    if (!isCurrentMonth) return "text-[#B0B0B0]";
    return "text-black";
  }

  const days = getDays(today.month(), today.year());

  return (
    <>
      {/* Calendar Container */}
      <div className="rounded-2xl border-[#DFE4EA] border-[1px] px-4 py-4 mb-4 relative">
        <h2 className="subheading-custom-2 pb-4">Leave Calendar</h2>

        <div className="rounded-2xl border-[#DFE4EA] border-[1px] px-4 py-4 flex-col justify-between items-center">
          {/* Header */}
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
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
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
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </div>
            </div>
          </div>

          {/* Days of the week */}
          <div className="grid grid-cols-7 bg-[#EBF1FF] rounded-t-xl">
            {daysOfTheWeek.map((day, index) => (
              <h1
                key={index}
                className="h-10 font-semibold grid place-content-center text-sm text-gray-700"
              >
                {day}
              </h1>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7">
            {days.map(({ date, currentMonth, today: isToday }, index) => {
              const dateKey = date.format("YYYY-MM-DD");
              const hasLeave = leaveMap[dateKey]?.length > 0;

              return (
                <div
                  key={index}
                  onClick={() => hasLeave && setSelectedDate(dateKey)}
                  className={`relative h-12 grid place-content-center border-[1px] border-[#ebeef1] cursor-pointer hover:bg-[#EDCEAF] transition-all duration-200 ${getDayClass(
                    today.month(),
                    currentMonth,
                    isToday
                  )}`}
                >
                  <h1>{date.date()}</h1>
                  {hasLeave && (
                    <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-4 h-1 bg-[#E7AE40]" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {selectedDate && (
        <Portal>
        <div
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-[1005] lg:w-[screen] lg:h-full"
          onClick={() => setSelectedDate(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-6 w-[90%] max-w-md lg:absolute lg:top-40"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="subheading-custom-2 mb-3">
              Leaves on {dayjs(selectedDate).format("DD MMM YYYY")}
            </h2>
            <div className="max-h-[300px] overflow-y-auto">
              {leaveMap[selectedDate]?.map((leave, i) => (
                <div
                  key={i}
                  className="border-b border-gray-200 py-2 flex flex-col gap-0.5"
                >
                  <p className="font-semibold text-gray-800">
                    {leave.employees?.full_name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {leave.employees?.department} — {leave.leave_type}
                  </p>
                  <p className="text-xs text-gray-500">
                    {dayjs(leave.start_date).format("DD MMM")} →{" "}
                    {dayjs(leave.end_date).format("DD MMM")}
                  </p>
                </div>
              ))}
            </div>
            <button
              className="mt-4 bg-[#EDCEAF] hover:bg-[#e4b98b] text-black py-1.5 px-4 rounded-lg w-full font-medium cursor-pointer"
              onClick={() => setSelectedDate(null)}
            >
              Close
            </button>
          </div>
        </div>
        </Portal>
      )}
    </>
  );
}

export default Calendar;