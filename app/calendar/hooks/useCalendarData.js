import { useState, useEffect } from "react";

export function useCalendarData() {
  const [events, setEvents] = useState([]);
  const [shifts, setShifts] = useState([]);

  const fetchEvents = async () => {
    const r = await fetch("/api/activities");
    const data = await r.json();
    if (Array.isArray(data)) setEvents(data);
  };

  const fetchShifts = async () => {
    const r = await fetch("/api/psychologist-shifts");
    const data = await r.json();
    if (Array.isArray(data)) setShifts(data);
  };

  useEffect(() => {
    fetchEvents();
    fetchShifts();
  }, []);

  return { events, shifts, fetchEvents, fetchShifts };
}