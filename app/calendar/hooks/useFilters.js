import { useState } from "react";

export function useFilters() {
  const [eventFilter, setEventFilter] = useState("ทั้งหมด");
  const [shiftFilter, setShiftFilter] = useState("ทั้งหมด");

  const toggleEventFilter = value => {
    if (eventFilter === value) {
      setEventFilter("ทั้งหมด");
      setShiftFilter(null);
    } else {
      setEventFilter(value);
      setShiftFilter(null);
    }
  };

  const toggleShiftFilter = value => {
    if (shiftFilter === value) {
      setShiftFilter("ทั้งหมด");
      setEventFilter(null);
    } else {
      setShiftFilter(value);
      setEventFilter(null);
    }
  };

  return {
    eventFilter,
    shiftFilter,
    setEventFilter,
    toggleEventFilter,
    toggleShiftFilter,
  };
}