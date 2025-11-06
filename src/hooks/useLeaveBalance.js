// src/hooks/useLeaveBalanceCheck.js
import { useMemo } from "react";

function getDatesBetween(start, end) {
  const dateArray = [];
  let currentDate = new Date(start);
  const stopDate = new Date(end);
  currentDate.setHours(0, 0, 0, 0);
  stopDate.setHours(0, 0, 0, 0);

  while (currentDate <= stopDate) {
    dateArray.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dateArray;
}

/**
 * @param {object} employee - Employee object containing total_leaves JSON
 * @param {Date|null} startDate - Selected start date
 * @param {Date|null} endDate - Selected end date
 * @param {string} leaveType - "Annual" | "Medical" | "Unpaid"
 */
export function useLeaveBalanceCheck(employee, startDate, endDate, leaveType) {
  return useMemo(() => {
    if (!employee || !startDate || !endDate || !leaveType) {
      return { isInsufficient: false, remaining: null, selectedDays: 0, message: "" };
    }

    const total_leaves = employee.total_leaves || {};
    const keyMap = {
      Annual: "annualLeave",
      Medical: "medicalLeave",
      Unpaid: "unpaidLeave",
    };
    const leaveKey = keyMap[leaveType];

    const remaining = total_leaves[leaveKey]?.remaining ?? 0;
    const selectedDays = getDatesBetween(startDate, endDate).length;

    // Skip balance check for unpaid leave
    if (leaveType === "Unpaid") {
      return { isInsufficient: false, remaining, selectedDays, message: "" };
    }

    const isInsufficient = selectedDays > remaining;
    const message = isInsufficient
      ? `Not enough ${leaveType} leave balance (${remaining} days remaining).`
      : "";

    return { isInsufficient, remaining, selectedDays, message };
  }, [employee, startDate, endDate, leaveType]);
}
