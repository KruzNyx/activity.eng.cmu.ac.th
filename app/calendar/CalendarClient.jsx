// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import styles from "./calendar.module.css";

// // Import Utils & Constants
// import { GROUPS, SHIFTS, DAYS, MONTHS_TH, HOURS } from "./utils/constants";
// import { fmtTime, getPos, getH } from "./utils/dateUtils";

// // Import Hooks
// import { useCalendarData } from "./hooks/useCalendarData";

// // Import Components
// import Sidebar from "./components/Sidebar";
// import Timeline from "./components/timeline";
// import CreateEventModal from "./components/CreateEventModal";

// export default function CalendarClient() {
//   const router = useRouter();
//   const [me, setMe] = useState(null);
//   const [checkedAuth, setCheckedAuth] = useState(false);
//   const { events, shifts, fetchEvents, fetchShifts } = useCalendarData();

//   const [createMode, setCreateMode] = useState("EVENT"); // EVENT | SHIFT
//   const [currentDate, setCurrentDate] = useState(new Date());
//   const [selectedEvent, setSelectedEvent] = useState(null);
//   const [showModal, setShowModal] = useState(false);
//   const [eventFilter, setEventFilter] = useState("ทั้งหมด");
//   const [shiftFilter, setShiftFilter] = useState(null);
//   const [hoverDate, setHoverDate] = useState(null);

//   const [form, setForm] = useState({
//     activity_name: "", psychologist_name: "", location: "", note: "",
//     start_date: "", end_date: "", start_time: "08:00", end_time: "09:00", activity_type: "SMO",
//   });

//   useEffect(() => {
//     fetch("/api/me").then(r => r.json()).then(data => {
//       if (!data) router.replace("/login"); else setMe(data);
//       setCheckedAuth(true);
//     }).catch(() => { router.replace("/login"); setCheckedAuth(true); });
//   }, [router]);


//   const toggleEventFilter = (value) => {
//   setShiftFilter(null); 
//   setEventFilter(prev => prev === value ? "ทั้งหมด" : value);
// };

// const toggleShiftFilter = (value) => {
//   setEventFilter(null);
//   setShiftFilter(prev => prev === value ? null : value);
// };

//   // const toggleEventFilter = (value) => {
//   //   if (eventFilter === value) { setEventFilter(null);}
//   //   else { setEventFilter(value); setShiftFilter(null);}
//   // };

//   // const toggleShiftFilter = (value) => {
//   //   (setEventFilter(null))
//   //     if (shiftFilter === value) { setShiftFilter(null);}
//   //     else { setShiftFilter(value); setEventFilter(null);}
//   // };

//   const handleLogout = async () => {
//     document.cookie = "user_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
//     router.replace("/login");
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const start_datetime = `${form.start_date} ${form.start_time}:00`;
//     const end_datetime = `${form.end_date} ${form.end_time}:00`;

//     if (createMode === "SHIFT") {
//       await fetch("/api/psychologist-shifts", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           psychologist_name: form.psychologist_name,
//           location: form.location,
//           start_datetime,
//           end_datetime,
//           note: form.note
//         })
//       });
//       setShowModal(false);
//       fetchShifts();
//       return;
//     }

//     const payload = {
//       activity_name: form.activity_name,
//       location: form.location,
//       start_datetime,
//       end_datetime,
//       activity_type: form.activity_type,
//       show_on_main_calendar: 1,
//       show_on_psycho_calendar: form.activity_type === "PSYCHO" ? 1 : 0,
//       created_by: me?.user_id || 1
//     };

//     try {
//       const r = await fetch("/api/activities", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });
//       if (r.ok) {
//         setShowModal(false);
//         fetchEvents();
//         setForm({
//           activity_name: "", location: "", start_date: "", end_date: "",
//           start_time: "08:00", end_time: "09:00", activity_type: "SMO",
//         });
//       } else { alert("เกิดข้อผิดพลาดในการบันทึก"); }
//     } catch (err) { console.error(err); }
//   };

//   if (!checkedAuth) return null;
// // if (!checkedAuth) return <div className={styles.loading}>กำลังโหลดข้อมูล...</div>;

//   const year = currentDate.getFullYear();
//   const month = currentDate.getMonth();
//   const firstDay = new Date(year, month, 1).getDay();
//   const totalDays = new Date(year, month + 1, 0).getDate();
//   const cells = Array.from({ length: firstDay + totalDays }, (_, i) => {
//     const d = i - firstDay + 1;
//     return d > 0 ? new Date(year, month, d) : null;
//   });

//   const getDayMatrix = (date) => {
//     if (!date) return { rows: [], dayShifts: [] };
//     const dStart = new Date(date).setHours(0, 0, 0, 0);
//     const dEnd = new Date(date).setHours(23, 59, 59, 999);

//     const dayEvents = (eventFilter !== null
//       ? events.filter(e => {
//           const s = new Date(e.start_datetime).getTime();
//           const en = new Date(e.end_datetime).getTime();
//           const isMatch = eventFilter === "ทั้งหมด" || e.activity_type === eventFilter;
//           return s <= dEnd && en >= dStart && isMatch}) :[]).sort((a, b) => new Date(a.start_datetime) - new Date(b.start_datetime));
//     //        (eventFilter === "ทั้งหมด" || e.activity_type === eventFilter));
//     //     })
//     //   : []
//     // ).sort((a, b) => new Date(a.start_datetime) - new Date(b.start_datetime));

//     const dayShifts = shiftFilter !== null
//       ? shifts.filter(s => {
//           const st = new Date(s.start_datetime).getTime();
//           const en = new Date(s.end_datetime).getTime();
//           if (st > dEnd || en < dStart) return false;
//           return shiftFilter === "ทั้งหมด" || s.psychologist_name === shiftFilter;
//         })
//       : [];

//     const rows = [];
//     const processedIds = new Set();
//     dayEvents.forEach(ev => {
//       if (processedIds.has(ev.activity_id)) return;
//       const overlaps = dayEvents.filter(other => {
//         const s1 = new Date(ev.start_datetime).getTime();
//         const e1 = new Date(ev.end_datetime).getTime();
//         const s2 = new Date(other.start_datetime).getTime();
//         const e2 = new Date(other.end_datetime).getTime();
//         return (s1 < e2 && s2 < e1);
//       });
//       rows.push(overlaps.map(o => {
//         processedIds.add(o.activity_id);
//         const s = new Date(o.start_datetime);
//         const en = new Date(o.end_datetime);
//         return {
//           ...o,
//           isStart: s.toDateString() === date.toDateString(),
//           isEnd: en.toDateString() === date.toDateString(),
//           displayS: s.getTime() < dStart ? new Date(dStart) : s,
//           displayE: en.getTime() > dEnd ? new Date(dEnd) : en
//         };
//       }));
//     });
//     return { rows, dayShifts };
//   };

//   return (
//     <div className={styles.dashboardContainer}>
//       <Sidebar 
//         me={me} year={year} month={month} currentDate={currentDate} 
//         setCurrentDate={setCurrentDate} 
        
//         eventFilter={eventFilter} 
//         toggleEventFilter={toggleEventFilter} 
        
//         shiftFilter={shiftFilter}
//         toggleShiftFilter={toggleShiftFilter}

//         handleLogout={handleLogout} 
//       />

//       <main className={styles.mainCalendar}>
//         <button className={styles.btnCreate} onClick={() => { setCreateMode("EVENT"); setShowModal(true); }}>กดเพื่อเพิ่มกิจกรรม</button>
//         <button className={styles.btnCreate} onClick={() => { setCreateMode("SHIFT"); setShowModal(true);}}>เพิ่มเวรนักจิต</button>
        
//         <div className={styles.calendarWrapper}>
//           <div className={styles.toolbar}>
//             <div className={styles.navBtns}>
//               <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))}>◀</button>
//               <button onClick={() => setCurrentDate(new Date())}>วันนี้</button>
//               <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))}>▶</button>
//             </div>
//           </div>

//           <div className={styles.calendarGrid}>
//             {DAYS.map(d => <div key={d} className={styles.gridHeader}>{d}</div>)}
//             {cells.map((date, i) => {
//               const { rows: matrix, dayShifts } = getDayMatrix(date);
//               const allDayEvents = matrix.flat();

//               return (
//                 <div 
//                   key={i} 
//                   className={`${styles.gridDay} ${!date ? styles.empty : ""}`}
//                   onMouseEnter={() => date && setHoverDate(date)}
//                   onMouseLeave={() => setHoverDate(null)}
//                 >
//                   {date && (
//                     <>
//                       <div className={styles.dayNum}>{date.getDate()}</div>
//                       {dayShifts.length > 0 && (
//                         <ul className={styles.shiftList}>
//                           {dayShifts.map(s => (
//                             <li key={s.id} className={styles.shiftItem} onClick={() => setSelectedEvent({ type: "SHIFT", date, items: dayShifts })}>
//                               <span className={styles.shiftTime}>{fmtTime(s.start_datetime)}–{fmtTime(s.end_datetime)}</span>
//                               {" "}<strong>{s.psychologist_name}</strong>
//                               {s.location && <span> @ {s.location}</span>}
//                             </li>
//                           ))}
//                         </ul>
//                       )}
                      
//                       <div className={styles.eventStack}>
//                         {matrix.map((rowItems, rIdx) => (
//                           <div key={rIdx} className={styles.rowWrapper}>
//                             {rowItems.map(ev => (
//                               <div
//                                 key={ev.activity_id}
//                                 className={`${styles.eventBar} ${styles["bar" + ev.activity_type]} ${ev.isStart ? styles.isStart : ""} ${ev.isEnd ? styles.isEnd : ""}`}
//                                 onClick={() => setSelectedEvent(ev)}
//                               >
//                                 {ev.isStart ? ev.activity_name : "\u00A0"}
//                               </div>
//                             ))}
//                           </div>
//                         ))}
//                       </div>

//                       {/* Detail Hover */}
//                       {hoverDate?.toDateString() === date.toDateString() && allDayEvents.length > 0 && (
//                         <div className={styles.hoverPop}>
//                           <div className={styles.popHeader}>ตารางเวลาละเอียด</div>
//                           <div className={styles.popTimeGrid}>
//                             {HOURS.map(h => (
//                               <div key={h} className={styles.hourRow}><span>{String(h).padStart(2, '0')}:00</span></div>
//                             ))}
//                             {allDayEvents.map((ev) => (
//                               <div key={ev.activity_id} className={styles.popEvent} style={{ 
//                                 top: getPos(ev.displayS, 30/60),
//                                 height: getH(ev.displayS, ev.displayE, 30/60), 
//                                 backgroundColor: GROUPS.find(g => g.code === ev.activity_type)?.color,
//                                 opacity: 0.9 
//                               }}>
//                                 {ev.activity_name}
//                               </div>
//                             ))}
//                           </div>
//                         </div>
//                       )}
//                     </>
//                   )}
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       </main>

//       <Timeline events={events} eventFilter={eventFilter} setSelectedEvent={setSelectedEvent} />

//       {/* Modals */}
//       {selectedEvent?.type === "SHIFT" && (
//         <div className={styles.overlay} onClick={() => setSelectedEvent(null)}>
//           <div className={styles.modal} onClick={e => e.stopPropagation()}>
//             <h3>เวรวันที่ {selectedEvent.date.getDate()} {MONTHS_TH[selectedEvent.date.getMonth()]}</h3>
//             <ul>
//               {selectedEvent.items.map(s => (
//                 <li key={s.id}>• {fmtTime(s.start_datetime)}–{fmtTime(s.end_datetime)} <strong>{s.psychologist_name}</strong> {s.location && ` @ ${s.location}`}</li>
//               ))}
//             </ul>
//             <button className={styles.closeBtn} onClick={() => setSelectedEvent(null)}>ปิด</button>
//           </div>
//         </div>
//       )}

//       {selectedEvent && !selectedEvent.type && (
//         <div className={styles.overlay} onClick={() => setSelectedEvent(null)}>
//           <div className={styles.modal} onClick={e => e.stopPropagation()}>
//             <h3 style={{color: GROUPS.find(g => g.code === selectedEvent.activity_type)?.color}}>{selectedEvent.activity_name}</h3>
//             <hr />
//             <p><strong>สถานที่:</strong> {selectedEvent.location || "-"}</p>
//             <p><strong>เวลาเริ่ม:</strong> {new Date(selectedEvent.start_datetime).toLocaleString("th-TH")}</p>
//             <p><strong>เวลาสิ้นสุด:</strong> {new Date(selectedEvent.end_datetime).toLocaleString("th-TH")}</p>
//             <button className={styles.closeBtn} onClick={() => setSelectedEvent(null)}>ตกลง</button>
//           </div>
//         </div>
//       )}

//       <CreateEventModal 
//         showModal={showModal} setShowModal={setShowModal} createMode={createMode} 
//         form={form} setForm={setForm} handleSubmit={handleSubmit} 
//       />
//     </div>
//   );
// }


// CalendarClient.jsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./calendar.module.css";

import { DAYS, MONTHS_TH, HOURS, GROUPS } from "./utils/constants";
import { fmtTime, getPos, getH } from "./utils/dateUtils";
import { useCalendarData } from "./hooks/useCalendarData";

import Sidebar from "./components/Sidebar";
import Timeline from "./components/timeline";
import CreateEventModal from "./components/CreateEventModal";

export default function CalendarClient() {
  const router = useRouter();
  const [me, setMe] = useState(null);
  const [checkedAuth, setCheckedAuth] = useState(false);
  const { events, shifts, fetchEvents, fetchShifts } = useCalendarData();

  const [createMode, setCreateMode] = useState("EVENT");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [eventFilter, setEventFilter] = useState("ทั้งหมด");
  const [shiftFilter, setShiftFilter] = useState(null);
  const [hoverDate, setHoverDate] = useState(null);

  const [form, setForm] = useState({
    activity_name: "", psychologist_name: "", location: "", note: "",
    start_date: "", end_date: "", start_time: "08:00", end_time: "09:00", activity_type: "SMO",
  });

  useEffect(() => {
    fetch("/api/me").then(r => r.json()).then(data => {
      if (!data) router.replace("/login"); else setMe(data);
      setCheckedAuth(true);
    }).catch(() => { router.replace("/login"); setCheckedAuth(true); });
  }, [router]);

  const toggleEventFilter = (value) => {
    setShiftFilter(null);
    setEventFilter(prev => prev === value ? "ทั้งหมด" : value);
  };

  const toggleShiftFilter = (value) => {
    setEventFilter(null);
    setShiftFilter(prev => prev === value ? null : value);
  };

  const handleLogout = async () => {
    document.cookie = "user_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.replace("/login");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const start_datetime = `${form.start_date} ${form.start_time}:00`;
    const end_datetime = `${form.end_date} ${form.end_time}:00`;

    const endpoint = createMode === "SHIFT" ? "/api/psychologist-shifts" : "/api/activities";
    const payload = createMode === "SHIFT" 
      ? { psychologist_name: form.psychologist_name, location: form.location, start_datetime, end_datetime, note: form.note }
      : { activity_name: form.activity_name, location: form.location, start_datetime, end_datetime, activity_type: form.activity_type, show_on_main_calendar: 1, created_by: me?.user_id || 1 };

    try {
      const r = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (r.ok) {
        setShowModal(false);
        createMode === "SHIFT" ? fetchShifts() : fetchEvents();
        setForm({ activity_name: "", psychologist_name: "", location: "", note: "", start_date: "", end_date: "", start_time: "08:00", end_time: "09:00", activity_type: "SMO" });
      }
    } catch (err) { console.error(err); }
  };

  if (!checkedAuth) return null;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const cells = Array.from({ length: firstDay + totalDays }, (_, i) => {
    const d = i - firstDay + 1;
    return d > 0 ? new Date(year, month, d) : null;
  });

  const getDayMatrix = (date) => {
    if (!date) return { rows: [], dayShifts: [] };
    const dStart = new Date(date).setHours(0, 0, 0, 0);
    const dEnd = new Date(date).setHours(23, 59, 59, 999);

    const dayEvents = (eventFilter !== null 
      ? events.filter(e => {
          const s = new Date(e.start_datetime).getTime();
          const en = new Date(e.end_datetime).getTime();
          return s <= dEnd && en >= dStart && (eventFilter === "ทั้งหมด" || e.activity_type === eventFilter);
        }) : []).sort((a, b) => new Date(a.start_datetime) - new Date(b.start_datetime));

    const dayShifts = shiftFilter !== null
      ? shifts.filter(s => {
          const st = new Date(s.start_datetime).getTime();
          const en = new Date(s.end_datetime).getTime();
          return st <= dEnd && en >= dStart && (shiftFilter === "ทั้งหมด" || s.psychologist_name === shiftFilter);
        }) : [];

    // Logic Matrix สำหรับ Event บาร์ยาว
    const rows = [];
    const processedIds = new Set();
    dayEvents.forEach(ev => {
      if (processedIds.has(ev.activity_id)) return;
      const overlaps = dayEvents.filter(other => {
        const s1 = new Date(ev.start_datetime).getTime();
        const e1 = new Date(ev.end_datetime).getTime();
        const s2 = new Date(other.start_datetime).getTime();
        const e2 = new Date(other.end_datetime).getTime();
        return (s1 < e2 && s2 < e1);
      });
      rows.push(overlaps.map(o => {
        processedIds.add(o.activity_id);
        return { ...o, 
          isStart: new Date(o.start_datetime).toDateString() === date.toDateString(),
          isEnd: new Date(o.end_datetime).toDateString() === date.toDateString(),
          displayS: Math.max(new Date(o.start_datetime), dStart),
          displayE: Math.min(new Date(o.end_datetime), dEnd)
        };
      }));
    });
    return { rows, dayShifts };
  };

  return (
    <div className={styles.dashboardContainer}>
      <Sidebar 
        me={me} year={year} month={month} currentDate={currentDate} 
        setCurrentDate={setCurrentDate} 
        eventFilter={eventFilter} toggleEventFilter={toggleEventFilter} 
        shiftFilter={shiftFilter} toggleShiftFilter={toggleShiftFilter}
        handleLogout={handleLogout} 
      />

      <main className={styles.mainCalendar}>
        <div className={styles.actionHeader}>
            <button className={styles.btnCreate} onClick={() => { setCreateMode("EVENT"); setShowModal(true); }}>กดเพื่อเพิ่มกิจกรรม</button>
            <button className={styles.btnCreate} onClick={() => { setCreateMode("SHIFT"); setShowModal(true);}}>เพิ่มเวรนักจิต</button>
        </div>
        
        <div className={styles.calendarWrapper}>
          <div className={styles.toolbar}>
            <div className={styles.navBtns}>
              <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))}><i className="fa-solid fa-caret-left"></i></button>
              <button onClick={() => setCurrentDate(new Date())}>วันนี้</button>
              <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))}>▶</button>
            </div>
          </div>

          <div className={styles.calendarGrid}>
            {DAYS.map(d => <div key={d} className={styles.gridHeader}>{d}</div>)}
            {cells.map((date, i) => {
              const { rows: matrix, dayShifts } = getDayMatrix(date);
              const allDayEvents = matrix.flat();
              return (
                <div key={i} className={`${styles.gridDay} ${!date ? styles.empty : ""}`} onMouseEnter={() => date && setHoverDate(date)} onMouseLeave={() => setHoverDate(null)}>
                  {date && (
                    <>
                      <div className={styles.dayNum}>{date.getDate()}</div>
                      {dayShifts.map(s => (
                        <div key={s.id} className={styles.shiftItem} onClick={() => setSelectedEvent({ type: "SHIFT", date, items: dayShifts })}>
                           <strong>{s.psychologist_name}</strong>
                        </div>
                      ))}
                      <div className={styles.eventStack}>
                        {matrix.map((rowItems, rIdx) => (
                          <div key={rIdx} className={styles.rowWrapper}>
                            {rowItems.map(ev => (
                              <div key={ev.activity_id} className={`${styles.eventBar} ${styles["bar" + ev.activity_type]} ${ev.isStart ? styles.isStart : ""} ${ev.isEnd ? styles.isEnd : ""}`} onClick={() => setSelectedEvent(ev)}>
                                {ev.isStart ? ev.activity_name : "\u00A0"}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                      
                      {/* รายละเอียด Hover */}
                      {hoverDate?.toDateString() === date.toDateString() && allDayEvents.length > 0 && (
                        <div className={styles.hoverPopFixed}>
                           <div className={styles.popHeader}>ตารางเวลาละเอียด</div>
                           <div className={styles.popTimeGrid}>
                             {HOURS.map(h => <div key={h} className={styles.hourRow}><span>{String(h).padStart(2, '0')}:00</span></div>)}
                             {allDayEvents.map(ev => (
                               <div key={ev.activity_id} className={styles.popEvent} style={{ top: getPos(ev.displayS, 30/60), height: getH(ev.displayS, ev.displayE, 30/60), backgroundColor: GROUPS.find(g => g.code === ev.activity_type)?.color }}>
                                 {ev.activity_name}
                               </div>
                             ))}
                           </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <Timeline events={events} eventFilter={eventFilter} setSelectedEvent={setSelectedEvent} />

      {/* Modal แสดงรายละเอียด (Event & Shift) */}
      {selectedEvent && (
        <div className={styles.overlay} onClick={() => setSelectedEvent(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            {selectedEvent.type === "SHIFT" ? (
              <>
                <h3>เวรวันที่ {selectedEvent.date.getDate()} {MONTHS_TH[selectedEvent.date.getMonth()]}</h3>
                {selectedEvent.items.map(s => <p key={s.id}>• {fmtTime(s.start_datetime)} {s.psychologist_name} @ {s.location}</p>)}
              </>
            ) : (
              <>
                <h3 style={{color: GROUPS.find(g => g.code === selectedEvent.activity_type)?.color}}>{selectedEvent.activity_name}</h3>
                <p>📍 {selectedEvent.location || "-"}</p>
                <p>⏰ {new Date(selectedEvent.start_datetime).toLocaleString("th-TH")}</p>
              </>
            )}
            <button className={styles.closeBtn} onClick={() => setSelectedEvent(null)}>ปิด</button>
          </div>
        </div>
      )}

      <CreateEventModal 
        showModal={showModal} setShowModal={setShowModal} createMode={createMode} 
        form={form} setForm={setForm} handleSubmit={handleSubmit} 
      />
    </div>
  );
}