export const getDayMatrix = ({
  date,
  events,
  shifts,
  eventFilter,
  shiftFilter,
}) => {
  if (!date) return { rows: [], dayShifts: [] };

  const dStart = new Date(date).setHours(0, 0, 0, 0);
  const dEnd = new Date(date).setHours(23, 59, 59, 999);

  const dayEvents =
    eventFilter !== null
      ? events
          .filter(e => {
            const s = new Date(e.start_datetime).getTime();
            const en = new Date(e.end_datetime).getTime();
            return (
              s <= dEnd &&
              en >= dStart &&
              (eventFilter === "ทั้งหมด" ||
                e.activity_type === eventFilter)
            );
          })
          .sort(
            (a, b) =>
              new Date(a.start_datetime) -
              new Date(b.start_datetime)
          )
      : [];

  const dayShifts =
    shiftFilter !== null
      ? shifts.filter(s => {
          const st = new Date(s.start_datetime).getTime();
          const en = new Date(s.end_datetime).getTime();
          if (st > dEnd || en < dStart) return false;
          return (
            shiftFilter === "ทั้งหมด" ||
            s.psychologist_name === shiftFilter
          );
        })
      : [];

  const rows = [];
  const processedIds = new Set();

  dayEvents.forEach(ev => {
    if (processedIds.has(ev.activity_id)) return;

    const overlaps = dayEvents.filter(other => {
      const s1 = new Date(ev.start_datetime).getTime();
      const e1 = new Date(ev.end_datetime).getTime();
      const s2 = new Date(other.start_datetime).getTime();
      const e2 = new Date(other.end_datetime).getTime();
      return s1 < e2 && s2 < e1;
    });

    rows.push(
      overlaps.map(o => {
        processedIds.add(o.activity_id);
        const s = new Date(o.start_datetime);
        const en = new Date(o.end_datetime);
        return {
          ...o,
          isStart: s.toDateString() === date.toDateString(),
          isEnd: en.toDateString() === date.toDateString(),
          displayS:
            s.getTime() < dStart ? new Date(dStart) : s,
          displayE:
            en.getTime() > dEnd ? new Date(dEnd) : en,
        };
      })
    );
  });

  return { rows, dayShifts };
};