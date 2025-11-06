import dayjs from "dayjs";

export const getDays = (month = dayjs().month(), year = dayjs().year()) => {
  const firstDayOfMonth = dayjs().year(year).month(month).startOf("month");
  const lastDayOfMonth = dayjs().year(year).month(month).endOf("month");

  const dateArray = [];

  // 🔹 Previous month's trailing days
  for (let i = 0; i < firstDayOfMonth.day(); i++) {
    const date = firstDayOfMonth.subtract(firstDayOfMonth.day() - i, "day");
    dateArray.push({
      date,
      currentMonth: false,
      today: date.isSame(dayjs(), "day"),
    });
  }

  // 🔹 Current month days (1..=last day ✅)
  for (let i = 1; i <= lastDayOfMonth.date(); i++) {
    const currentDate = dayjs(new Date(year, month, i));
    dateArray.push({
      currentMonth: true,
      date: currentDate,
      today: currentDate.isSame(dayjs(), "day"),
    });
  }

  // 🔹 Next month's leading days to fill 42 cells (6 weeks)
  const forwardDays = 42 - dateArray.length;
  for (let i = 1; i <= forwardDays; i++) {
    const date = lastDayOfMonth.add(i, "day");
    dateArray.push({
      date,
      currentMonth: false,
      today: date.isSame(dayjs(), "day"),
    });
  }

  return dateArray;
};

export const daysOfTheWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
