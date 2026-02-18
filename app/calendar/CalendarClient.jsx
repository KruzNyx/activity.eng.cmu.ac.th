// app\calendar\CalendarClient.jsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./Calendar.module.css";
// import { group } from "console";

const GROUPS = [
  { code: "SMO", label: "SMO", color: "#10b981" },
  { code: "SD", label: "SD", color: "#6366f1" },
  { code: "PSYCHO", label: "PSYCHO", color: "#ef4444" },
];

const fmtTime = (dt) =>
  new Date(dt).toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  });

const SHIFTS = [
  { code: "น้ำขิง", label: "น้ำขิง", color: "var(--color-nk)" },
  { code: "ป๊อป", label: "ป๊อป", color: "var(--color-pop)" },
];

// const SHIFT_CODES = SHIFTS.map(s => s.code);
// const isShiftType = (type) => SHIFT_CODES.includes(type);

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS_TH = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
];

const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function CalendarClient() {
  const [createMode, setCreateMode] = useState("EVENT"); // EVENT | SHIFT
  const router = useRouter();
  const [me, setMe] = useState(null);
  const [checkedAuth, setCheckedAuth] = useState(false);

  const [events, setEvents] = useState([]); //SMO SD PSY กิจกรรม
  const [shifts, setShifts] = useState([]); //PSY ตารางทำงานนอกสถานที่

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [eventFilter, setEventFilter] = useState("ทั้งหมด");   // SMO / SD / PSYCHO
  const [shiftFilter, setShiftFilter] = useState("ทั้งหมด");   // พี่น้ำขิง / พี่ป๊อป
  const [hoverDate, setHoverDate] = useState(null);

  const toggleEventFilter = (value) => {
  if (eventFilter === value) {
    // กดซ้ำ = reset
    setEventFilter("ทั้งหมด");
    setShiftFilter(null);
  } else {
    setEventFilter(value);
    setShiftFilter(null);
  }
};

const toggleShiftFilter = (value) => {
  if (shiftFilter === value) {
    // กดซ้ำ = reset 
    setShiftFilter("ทั้งหมด");
    setEventFilter(null);
  } else {
    setShiftFilter(value);
    setEventFilter(null);
  }
};

  const [form, setForm] = useState({
  activity_name: "",
  psychologist_name: "",
  location: "",
  note: "",
  start_date: "",
  end_date: "",
  start_time: "08:00",
  end_time: "09:00",
  activity_type: "SMO",
});

  // const [form, setForm] = useState({
  //   activity_name: "", location: "", start_date: "", end_date: "",
  //   start_time: "08:00", end_time: "09:00", activity_type: "SMO",
  // });

  useEffect(() => {
    fetch("/api/me").then(r => r.json()).then(data => {
      if (!data) router.replace("/login"); else setMe(data);
      setCheckedAuth(true);
    }).catch(() => { router.replace("/login"); setCheckedAuth(true); });
  }, [router]);

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
  fetchShifts(); // หรือ fetchShifts("น้ำขิง")
}, []);

  const handleLogout = async () => {
    document.cookie = "user_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.replace("/login");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const start_datetime = `${form.start_date} ${form.start_time}:00`;
    const end_datetime = `${form.end_date} ${form.end_time}:00`;

    if (createMode === "SHIFT") {
      await fetch("/api/psychologist-shifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          psychologist_name: form.psychologist_name,
          location: form.location,
          start_datetime,
          end_datetime,
          note: form.note
        })
      });

      setShowModal(false);
      // fetchShifts(form.psychologist_name); // รีเฟรชตารางนักจิต
      fetchShifts();
      return; // ⬅️ สำคัญมาก ไม่ให้ไหลไป event
    }

    const payload = {
      activity_name: form.activity_name,
      location: form.location,
      start_datetime,
      end_datetime,
      activity_type: form.activity_type,
      show_on_main_calendar: 1,
      show_on_psycho_calendar: form.activity_type === "PSYCHO" ? 1 : 0,
      created_by: me?.user_id || 1
    };

    try {
      const r = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (r.ok) {
        setShowModal(false);
        fetchEvents();
        setForm({
          activity_name: "", location: "", start_date: "", end_date: "",
          start_time: "08:00", end_time: "09:00", activity_type: "SMO",
        });
      } else {
        alert("เกิดข้อผิดพลาดในการบันทึก");
      }
    } catch (err) {
      console.error(err);
    }


    



  };

  const getPos = (dt, ratio) => (new Date(dt).getHours() * 60 + new Date(dt).getMinutes()) * ratio;
  const getH = (s, en, ratio) => Math.max(25, (new Date(en) - new Date(s)) / 60000 * ratio);

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
    // if (!date) return [];
    if (!date) return { rows: [], dayShifts: [] };
    const dStart = new Date(date).setHours(0, 0, 0, 0);
    const dEnd = new Date(date).setHours(23, 59, 59, 999);

const dayEvents =
  (eventFilter !== null
    ? events.filter(e => {
        const s = new Date(e.start_datetime).getTime();
        const en = new Date(e.end_datetime).getTime();
        return (
          s <= dEnd &&
          en >= dStart &&
          (eventFilter === "ทั้งหมด" || e.activity_type === eventFilter)
        );
      })
    : []
  ).sort((a, b) => new Date(a.start_datetime) - new Date(b.start_datetime));


// const dayShifts =
//   shiftFilter !== null
//     ? [] // ถ้าเลือกหน่วยงาน → ไม่แสดงเวร
//     : shifts.filter(s => {
//         const st = new Date(s.start_datetime).getTime();
//         const en = new Date(s.end_datetime).getTime();
//         if (st > dEnd || en < dStart) return false;
//         return shiftFilter === "ทั้งหมด" || s.psychologist_name === shiftFilter;
//       });

const dayShifts =
  shiftFilter !== null
    ? shifts.filter(s => {
        const st = new Date(s.start_datetime).getTime();
        const en = new Date(s.end_datetime).getTime();
        if (st > dEnd || en < dStart) return false;
        return shiftFilter === "ทั้งหมด" || s.psychologist_name === shiftFilter;
      })
    : [];

  //   const dayShifts = shifts.filter(s => {
  //   const st = new Date(s.start_datetime).getTime();
  //   const en = new Date(s.end_datetime).getTime();
    
  //   if (shiftFilter !== "ทั้งหมด" && s.psychologist_name !== shiftFilter) {
  //     return false;
  //   }
    
  //   return st <= dEnd && en >= dStart;
  // });

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
        const s = new Date(o.start_datetime);
        const en = new Date(o.end_datetime);
        return {
          ...o,
          isStart: s.toDateString() === date.toDateString(),
          isEnd: en.toDateString() === date.toDateString(),
          displayS: s.getTime() < dStart ? new Date(dStart) : s,
          displayE: en.getTime() > dEnd ? new Date(dEnd) : en
        };
      }));
    });
    return { rows, dayShifts };
  };

  return (
    <div className={styles.dashboardContainer}>
      <aside className={styles.leftSidebar}>
            <header className={styles.userHeader}>
              <div>ผู้ใช้งาน: <strong>{me?.username}</strong></div>
              
            </header>
        <div className={styles.sidebarCard}>
          <h3>เลือกเดือน</h3>
          {/* <input type="month" className={styles.monthPicker} value={`${year}-${String(month + 1).padStart(2, '0')}`} onChange={(e) => setCurrentDate(new Date(e.target.value + "-01"))} /> */}
          {/* <input type="month"className={styles.monthPicker}value={`${year}-${String(month + 1).padStart(2, "0")}`}onChange={(e) => {const [y, m] = e.target.value.split("-");setCurrentDate(new Date(Number(y), Number(m) - 1, 1));}}/> */}
 <div style={{ display: "flex", gap: "8px" }}>
  {/* เลือกปี */}
  <select
    className={styles.monthPicker}
    value={year}
    onChange={(e) => {
      const next = new Date(currentDate);
      next.setFullYear(+e.target.value);
      setCurrentDate(next);
    }}
  >
    {Array.from({ length: 11 }, (_, i) => {
      const y = new Date().getFullYear() - 5 + i;
      return (
        <option key={y} value={y}>
          {y + 543}
        </option>
      );
    })}
  </select>

  {/* เลือกเดือน */}
  <select
    className={styles.monthPicker}
    value={month}
    onChange={(e) => {
      const next = new Date(currentDate);
      next.setMonth(+e.target.value);
      setCurrentDate(next);
    }}
  >
    {MONTHS_TH.map((m, i) => (
      <option key={i} value={i}>
        {m}
      </option>
    ))}
  </select>
</div>       
        </div>
        <div className={styles.sidebarCard}>
          <h3> หน่วยงาน </h3>
          <div className={styles.filterList}>
            <button className={`${styles.filterBtn} ${eventFilter === "ทั้งหมด" ? styles.active : ""}`} onClick={() => toggleEventFilter("ทั้งหมด")}>ทั้งหมด</button>
            {GROUPS.map(g => (<button key={g.code}style={{"--active-color":g.code === "SMO"? "var(--color-smo)": g.code === "SD"? "var(--color-sd)": "var(--color-psycho)"}}className={`${styles.filterBtn} ${eventFilter === g.code ? styles.active : ""}`}onClick={() => toggleEventFilter(g.code)}>{g.label}</button>))}
          </div>
        </div>

        <div className={styles.sidebarCard}>
          <h3> นักจิต </h3>
            <div className={styles.filterList}>
              {/* <button className={`${styles.filterBtn} ${shiftFilter === "ทั้งหมด" ? styles.active : ""}`}onClick={() => setShiftFilter("ทั้งหมด")}>ทั้งหมด</button> */}
              <button className={`${styles.filterBtn} ${shiftFilter === "ทั้งหมด" ? styles.active : ""}`} onClick={() => {setShiftFilter("ทั้งหมด"); setEventFilter(null);}}>ทั้งหมด</button>
              {SHIFTS.map(g => (<button key={g.code}style={{"--active-color":g.code === "น้ำขิง"? "var(--color-nk)": g.code === "ป๊อป"? "var(--color-pop)": ""}}className={`${styles.filterBtn} ${shiftFilter === g.code ? styles.active : ""}`} 
              onClick={() => toggleShiftFilter(g.code)}
              // onClick={() => { setShiftFilter(g.code); fetchShifts(g.code) ;}} 
                >{g.label}</button>))}
            </div>
        </div>
        <button onClick={handleLogout} className={styles.btnLogout}>Logout</button>
      </aside>

      <main className={styles.mainCalendar}>
        <button
        className={styles.btnCreate} onClick={() => { setCreateMode("EVENT"); setShowModal(true); }}> กดเพื่อเพิ่มกิจกรรม</button>
        <button className={styles.btnCreate} onClick={() => { setCreateMode("SHIFT"); setShowModal(true);}}> เพิ่มเวรนักจิต</button>
        <div className={styles.calendarWrapper}>
          <div className={styles.toolbar}>
            {/* <h2>{MONTHS_TH[month]} {year + 543}</h2> */}
            <div className={styles.navBtns}>
              <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))}>◀</button>
              <button onClick={() => setCurrentDate(new Date())}>วันนี้</button>
              <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))}>▶</button>
            </div>
          </div>

          <div className={styles.calendarGrid}>
            {DAYS.map(d => <div key={d} className={styles.gridHeader}>{d}</div>)}
            {cells.map((date, i) => {
              // const matrix = getDayMatrix(date);
              // const allDayEvents = matrix.flat();
              const { rows: matrix, dayShifts } = getDayMatrix(date);
              const allDayEvents = matrix.flat();

              return (
                <div 
                  key={i} 
                  className={`${styles.gridDay} ${!date ? styles.empty : ""}`}
                  onMouseEnter={() => date && setHoverDate(date)}
                  onMouseLeave={() => setHoverDate(null)}
                >
                  {date && (
                    <>
<div className={styles.dayNum}>{date.getDate()}</div>
{/* เวรนักจิต (Bullet) */}
{dayShifts.length > 0 && (
  <ul className={styles.shiftList}>
    {dayShifts.map(s => (
      <li
        key={s.id}
        className={styles.shiftItem}
        onClick={() =>
          setSelectedEvent({
            type: "SHIFT",
            date,
            items: dayShifts
          })
        }
      >
        <span className={styles.shiftTime}>
          {fmtTime(s.start_datetime)}–{fmtTime(s.end_datetime)}
        </span>
        {" "}
        <strong>{s.psychologist_name}</strong>
        {s.location && <span> @ {s.location}</span>}
      </li>
    ))}
  </ul>
)}

                      
                      <div className={styles.eventStack}>

                        {matrix.map((rowItems, rIdx) => (
                          <div key={rIdx} className={styles.rowWrapper}>
                            {rowItems.map(ev => (
                              <div
                                key={ev.activity_id}
                                className={`${styles.eventBar} ${styles["bar" + ev.activity_type]} ${ev.isStart ? styles.isStart : ""} ${ev.isEnd ? styles.isEnd : ""}`}
                                onClick={() => setSelectedEvent(ev)}
                              >
                                {ev.isStart ? ev.activity_name : "\u00A0"}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
{selectedEvent?.type === "SHIFT" && (
  <div className={styles.overlay} onClick={() => setSelectedEvent(null)}>
    <div className={styles.modal} onClick={e => e.stopPropagation()}>
      <h3>
        เวรวันที่ {selectedEvent.date.getDate()}{" "}
        {MONTHS_TH[selectedEvent.date.getMonth()]}
      </h3>
      <ul>
        {selectedEvent.items.map(s => (
          <li key={s.id}>
            • {fmtTime(s.start_datetime)}–{fmtTime(s.end_datetime)}{" "}
            <strong>{s.psychologist_name}</strong>
            {s.location && ` @ ${s.location}`}
          </li>
        ))}
      </ul>

      <button
        className={styles.closeBtn}
        onClick={() => setSelectedEvent(null)}
      >
        ปิด
      </button>
    </div>
  </div>
)}
                      {hoverDate?.toDateString() === date.toDateString() && allDayEvents.length > 0 && (
                        <div className={styles.hoverPop}>
                          <div className={styles.popHeader}>ตารางเวลาละเอียด</div>
                          <div className={styles.popTimeGrid}>
                            {HOURS.map(h => (
                              <div key={h} className={styles.hourRow}>
                                <span>{String(h).padStart(2, '0')}:00</span>
                              </div>
                            ))}
                            {allDayEvents.map((ev) => (
                              <div key={ev.activity_id} className={styles.popEvent} style={{ 
                                top: getPos(ev.displayS, 30/60),
                                height: getH(ev.displayS, ev.displayE, 30/60), 
                                backgroundColor: GROUPS.find(g => g.code === ev.activity_type)?.color,
                                opacity: 0.9 
                              }}>
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

      <aside className={styles.rightTimeline}>
        <div className={styles.timelineHeader}>
          <h3>กิจกรรม{eventFilter === "ทั้งหมด" ? "ทั้งหมด" : `กลุ่ม ${eventFilter}`}</h3>
        </div>
        
        <div className={styles.timelineList}>
          {events
            .filter(e => eventFilter === "ทั้งหมด" || e.activity_type === eventFilter)
            .sort((a, b) => new Date(a.start_datetime) - new Date(b.start_datetime))
            .slice(0, 15)
            .map((ev) => {
              const startDate = new Date(ev.start_datetime);
              const endDate = new Date(ev.end_datetime);
              const isSameDay = startDate.toDateString() === endDate.toDateString();

              return (
                <div key={ev.activity_id} className={styles.timelineItem} onClick={() => setSelectedEvent(ev)} style={{cursor: 'pointer'}}>
                  <div className={styles.timelineDateSection}>
                   
                    <div 
                      className={styles.typeStarIcon} 
                      style={{ backgroundColor: GROUPS.find(g => g.code === ev.activity_type)?.color || "#6366f1" }}
                    >
                      {ev.activity_type[0]}
                    </div>

                    <div className={styles.dateDisplay}>
                      <span className={styles.dayRange}>
                        {startDate.getDate()}
                        {!isSameDay && `-${endDate.getDate()}`}
                      </span>
                      <span className={styles.monthName}>
                        {MONTHS_TH[startDate.getMonth()].substring(0, 3)}
                      </span>
                    </div>
                  </div>

                  <div className={styles.eventDetail}>
                    <h4 className={styles.eventTitle}>{ev.activity_name}</h4>
                    <p className={styles.eventLocation}>
                      {ev.location ? `@ ${ev.location}` : "—"}
                    </p>
                    {isSameDay && (
                      <p className={styles.eventTime}>
                        {startDate.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
{events.filter(e =>
  eventFilter === "ทั้งหมด" || e.activity_type === eventFilter
).length === 0 && (
  <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>
    ไม่มีกิจกรรมในหมวดหมู่นี้
  </div>
)}
        </div>
      </aside>

      {/* Modal View Detail */}
      {/* {selectedEvent && ( */}
      {selectedEvent && !selectedEvent.type && (
        <div className={styles.overlay} onClick={() => setSelectedEvent(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 style={{color: GROUPS.find(g => g.code === selectedEvent.activity_type)?.color}}>{selectedEvent.activity_name}</h3>
            <hr />
            <p><strong>สถานที่:</strong> {selectedEvent.location || "-"}</p>
            <p><strong>เวลาเริ่ม:</strong> {new Date(selectedEvent.start_datetime).toLocaleString("th-TH")}</p>
            <p><strong>เวลาสิ้นสุด:</strong> {new Date(selectedEvent.end_datetime).toLocaleString("th-TH")}</p>
            <button className={styles.closeBtn} onClick={() => setSelectedEvent(null)}>ตกลง</button>
          </div>
        </div>
      )}


      {/* Modal Create Activity */}
      {showModal && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <h3>{createMode === "SHIFT" ? "เพิ่มเวรนักจิต" : "สร้างกิจกรรมใหม่"}</h3>
            {/* <h3 style={{ marginBottom: '15px' }}>สร้างกิจกรรมใหม่</h3> */}
            <form onSubmit={handleSubmit} className={styles.createForm}>
        {createMode === "SHIFT" && (
          <>
            <div className={styles.formGroup}>
              <label>นักจิต</label>
              <select
                required
                value={form.psychologist_name || ""}
                onChange={e =>
                  setForm({ ...form, psychologist_name: e.target.value })
                }
              >
                <option value="">-- เลือกนักจิต --</option>
                {SHIFTS.map(s => (
                  <option key={s.code} value={s.code}>{s.label}</option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>สถานที่</label>
              <input
                value={form.location}
                onChange={e => setForm({...form, location: e.target.value})}
              />
            </div>

            <div className={styles.formGroup}>
              <label>หมายเหตุ</label>
              <input
                value={form.note || ""}
                onChange={e => setForm({...form, note: e.target.value})}
              />
            </div>
          </>
        )}


            {createMode === "EVENT" && (
              <>
                <div className={styles.formGroup}>
                  <label>ชื่อกิจกรรม</label>
                  <input required type="text" value={form.activity_name} onChange={e => setForm({...form, activity_name: e.target.value})} placeholder="ระบุชื่อกิจกรรม..." />
                </div>
                                      
                <div className={styles.formGroup}>
                  <label>สถานที่</label>
                  <input type="text" value={form.location} onChange={e => setForm({...form, location: e.target.value})} placeholder="ระบุสถานที่..." />
                </div>
                <div className={styles.formGroup}>
                  <label>หน่วยงาน</label>
                  <select
                    required
                    value={form.activity_type}
                    onChange={e =>
                      setForm({ ...form, activity_type: e.target.value })
                    }
                  >
                    <option value="">-- เลือกหน่วยงาน --</option>
                    {GROUPS.map(g => (
                      <option key={g.code} value={g.code}>
                        {g.label}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}


              {/* วันที่ + เวลา (ใช้ทั้ง EVENT และ SHIFT) */}
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>วันที่เริ่ม</label>
                      <input
                        required
                        type="date"
                        value={form.start_date}
                        onChange={e => setForm({ ...form, start_date: e.target.value })}
                      />
                </div>
                <div className={styles.formGroup}>
                  <label>เวลา</label>
                      <input
                        required
                        type="time"
                        value={form.start_time}
                        onChange={e => setForm({ ...form, start_time: e.target.value })}
                      />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>วันที่สิ้นสุด</label>
                      <input
                        required
                        type="date"
                        value={form.end_date}
                        onChange={e => setForm({ ...form, end_date: e.target.value })}
                      />
                </div>
                <div className={styles.formGroup}>
                  <label>เวลา</label>
                      <input
                        required
                        type="time"
                        value={form.end_time}
                        onChange={e => setForm({ ...form, end_time: e.target.value })}
                      />
                </div>
              </div>

          <div className={styles.modalButtons}>
            <button
              type="button"className={styles.closeBtn}onClick={() => setShowModal(false)}>ยกเลิก
            </button>
            <button type="submit" className={styles.btnCreate}>บันทึก
            </button>
          </div>
              </form>
            </div>
          </div>
        )}

</div>
);
      }
