"use client";

import { useEffect, useState } from "react";
import styles from "./Calendar.module.css";

const GROUPS = [
  { code: "SMO", label: "SMO" },
  { code: "SD", label: "SD" },
  { code: "PSYCHO", label: "PSYCHO" },
];

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS_TH = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
];

export default function CalendarClient() {
  const [events, setEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [form, setForm] = useState({
    activity_name: "",
    location: "",
    date: "",
    start_time: "",
    end_time: "",
    activity_type: "SMO",
  });

  const fetchEvents = async () => {
    try {
      const r = await fetch("/api/activities");
      const data = await r.json();
      if (Array.isArray(data)) setEvents(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  const cells = Array.from({ length: firstDay + totalDays }, (_, i) => {
    const day = i - firstDay + 1;
    return day > 0 ? new Date(year, month, day) : null;
  });

  // ตรวจสอบว่าช่วงเวลาคาบเกี่ยวกันหรือไม่ (A เริ่มก่อน B จบ และ A จบหลัง B เริ่ม)
//   const isOverlapping = (eventA, eventB) => {
//     const startA = new Date(eventA.start_datetime).getTime();
//     const endA = new Date(eventA.end_datetime).getTime();
//     const startB = new Date(eventB.start_datetime).getTime();
//     const endB = new Date(eventB.end_datetime).getTime();
//     // return startA < endB && endA > startB;
// return startA <= endB && endA >= startB;
const isOverlapping = (eventA, eventB) => {
  const startA = new Date(eventA.start_datetime).getTime();
  const endA = new Date(eventA.end_datetime).getTime();
  const startB = new Date(eventB.start_datetime).getTime();
  const endB = new Date(eventB.end_datetime).getTime();
  
  // ใช้ < และ > เพื่อไม่ให้กิจกรรมที่เวลาต่อกันพอดีถูกนับว่าทับกัน
  return startA < endB && endA > startB;

  };

  const submit = async () => {
    const payload = {
      ...form,
      start_datetime: `${form.date}T${form.start_time}:00`,
      end_datetime: `${form.date}T${form.end_time}:00`,
    };

    const res = await fetch("/api/activities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setShowModal(false);
      fetchEvents();
    }
  };

  return (
    <div className={styles.calendarWrapper}>
      <div className={styles.calendarMonth}>
        <div className={styles.calendarToolbar}>
          <h2>
            {MONTHS_TH[month]} {year + 543}
          </h2>
          <div className={styles.navButtons}>
            <button className={styles.btnNav} onClick={() => setCurrentDate(new Date(year, month - 1, 1))}>◀</button>
            <button className={styles.btnNav} onClick={() => setCurrentDate(new Date())}>Today</button>
            <button className={styles.btnNav} onClick={() => setCurrentDate(new Date(year, month + 1, 1))}>▶</button>
            <button className={styles.btnCreate} onClick={() => setShowModal(true)}>➕ สร้างกิจกรรม</button>
          </div>
        </div>

        <div className={styles.calendarGrid}>
          {DAYS.map((d) => (
            <div key={d} className={styles.calendarHeader}>{d}</div>
          ))}

{cells.map((date, i) => {
  if (!date) return <div key={i} className={styles.emptyDay} />;

  // 1. กรองกิจกรรมของวันนั้นๆ
  const dayEvents = events.filter((e) => {
    const d = new Date(e.start_datetime);
    return (
      d.getFullYear() === date.getFullYear() &&
      d.getMonth() === date.getMonth() &&
      d.getDate() === date.getDate()
    );
  }).sort((a, b) => new Date(a.start_datetime) - new Date(b.start_datetime));

  // 2. สร้าง Function จัดกลุ่ม Overlap (ประกาศไว้ใช้ข้างในนี้ได้เลย)
  const buildOverlapGroups = (evs) => {
    const groups = [];
    evs.forEach(ev => {
      let placed = false;
      for (const group of groups) {
        if (group.some(e => isOverlapping(e, ev))) {
          group.push(ev);
          placed = true;
          break;
        }
      }
      if (!placed) groups.push([ev]);
    });
    return groups;
  };

  // 3. เรียกใช้งาน
  const overlapGroups = buildOverlapGroups(dayEvents);

  // 4. คืนค่า JSX ของแต่ละวัน
  return (
    <div key={i} className={styles.calendarDay}>
      <div className={styles.dayNumber}>{date.getDate()}</div>
      <div className={styles.eventContainer}>
        {overlapGroups.map((group, gIdx) =>
          group.length === 1 ? (
            // กรณีมีกิจกรรมเดียวในเวลานั้น
            <div
              key={group[0].activity_id}
              className={`${styles.event} ${styles["event" + group[0].activity_type]} ${styles.eventNormal}`}
              onClick={() => setSelectedEvent(group[0])}
            >
              {group[0].activity_name}
            </div>
          ) : (
            // กรณีมีหลายกิจกรรมทับซ้อนกัน
            <div key={gIdx} className={styles.overlapStackContainer}>
              {group.map((ev, idx) => (
                <div
                  key={ev.activity_id}
                  className={`${styles.event} ${styles["event" + ev.activity_type]} ${styles.eventOverlap}`}
                  style={{
                    zIndex: idx + 1,
                    top: idx * 15,   // ปรับระยะเหลื่อมตามความชอบ
                    left: idx * 5,
                    opacity: 0.9,
                  }}
                  onClick={() => setSelectedEvent(ev)}
                >
                  {ev.activity_name}
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
// })}
//           {cells.map((date, i) => {
//             if (!date) return <div key={i} className={styles.emptyDay} />;

//             const dayEvents = events.filter((e) => {
//               const d = new Date(e.start_datetime);
//               return (
//                 d.getFullYear() === date.getFullYear() &&
//                 d.getMonth() === date.getMonth() &&
//                 d.getDate() === date.getDate()
//               );
//             }).sort((a, b) => new Date(a.start_datetime) - new Date(b.start_datetime));

            // Logic จัดกลุ่มกิจกรรมที่เวลาชนกัน
            // let renderedGroups = [];
            // let processedIds = new Set();

            // dayEvents.forEach((ev) => {
            //   if (processedIds.has(ev.activity_id)) return;

            //   let group = dayEvents.filter(other => 
            //     !processedIds.has(other.activity_id) && isOverlapping(ev, other)
            //   );

            //   if (group.length > 1) {
            //     renderedGroups.push({ type: 'overlap', items: group });
            //     group.forEach(item => processedIds.add(item.activity_id));
            //   } else {
            //     renderedGroups.push({ type: 'single', item: ev });
            //     processedIds.add(ev.activity_id);
            //   }
            // });

                          // const buildOverlapGroups = (events) => {
                          //   const groups = [];

                          //   events.forEach(ev => {
                          //     let placed = false;

                          //     for (const group of groups) {
                          //       if (group.some(e => isOverlapping(e, ev))) {
                          //         group.push(ev);
                          //         placed = true;
                          //         break;
                          //       }
                          //     }

                          //     if (!placed) {
                          //       groups.push([ev]);
                          //     }
                          //   });

                          //   return groups;
                          // };

                          // const overlapGroups = buildOverlapGroups(dayEvents);


{overlapGroups.map((group, gIdx) =>
  group.length === 1 ? (
    // กิจกรรมเดียว แสดงผลปกติ
    <div
      key={group[0].activity_id}
      className={`${styles.event} ${styles["event" + group[0].activity_type]} ${styles.eventNormal}`}
      onClick={() => setSelectedEvent(group[0])}
    >
      {group[0].activity_name}
    </div>
  ) : (
    // กิจกรรมที่ทับซ้อนกัน
    <div key={gIdx} className={styles.overlapStackContainer}>
      {group.map((ev, idx) => (
        <div
          key={ev.activity_id}
          className={`${styles.event} ${styles["event" + ev.activity_type]} ${styles.eventOverlap}`}
          style={{
            zIndex: idx + 1,
            top: idx * 15,   // ยิ่งลำดับหลัง ยิ่งขยับลงมา 15px
            left: idx * 5,   // ขยับขวาเล็กน้อย 5px
            opacity: 0.9,
          }}
          onClick={() => setSelectedEvent(ev)}
        >
          {ev.activity_name}
        </div>
      ))}
    </div>
  )
)}

            return (
              <div key={i} className={styles.calendarDay}>
                <div className={styles.dayNumber}>{date.getDate()}</div>
                <div className={styles.eventContainer}>
                  {/* {renderedGroups.map((group, gIdx) => (
                    group.type === 'single' ? (
                      <div
                        key={group.item.activity_id}
                        className={`${styles.event} ${styles["event" + group.item.activity_type]}`}
                        onClick={() => setSelectedEvent(group.item)}
                      >
                        {group.item.activity_name}
                      </div>
                    ) : (
                      <div key={gIdx} className={styles.overlapStackContainer}>
                        {group.items.map((ev, idx) => (
                          <div
                            key={ev.activity_id}
                            className={`${styles.event} ${styles["event" + ev.activity_type]} ${styles.eventOverlap}`}
                            style={{ zIndex: idx + 1 }}
                            onClick={() => setSelectedEvent(ev)}
                          >
                            {ev.activity_name}
                          </div>
                        ))}
                      </div>
                    )
                  ))} */}
{/* {renderedGroups.map((group, gIdx) =>
  group.type === "single" ? (
    <div
      key={group.item.activity_id}
      className={`${styles.event} ${styles["event" + group.item.activity_type]} ${styles.eventNormal}`}
      onClick={() => setSelectedEvent(group.item)}
    >
      {group.item.activity_name}
    </div>
  ) : (
    <div key={gIdx} className={styles.overlapStackContainer}>
      {group.items.map((ev, idx) => (
        <div
          key={ev.activity_id}
          className={`${styles.event} ${styles["event" + ev.activity_type]} ${styles.eventOverlap}`}
          style={{
            zIndex: idx + 1,
            top: idx * 4,   // ⭐ เหลื่อมนิด ๆ
            left: idx * 4,
          }}
          onClick={() => setSelectedEvent(ev)}
        >
          {ev.activity_name}
        </div>
      ))}
    </div>
  )
)} */}


{overlapGroups.map((group, gIdx) =>
  group.length === 1 ? (
    <div
      key={group[0].activity_id}
      className={`${styles.event} ${styles["event" + group[0].activity_type]} ${styles.eventNormal}`}
      onClick={() => setSelectedEvent(group[0])}
    >
      {group[0].activity_name}
    </div>
  ) : (
    <div key={gIdx} className={styles.overlapStackContainer}>
      {group.map((ev, idx) => (
        <div
          key={ev.activity_id}
          className={`${styles.event} ${styles["event" + ev.activity_type]} ${styles.eventOverlap}`}
          // style={{
          //   zIndex: idx + 1,
          //   top: idx * 4,
          //   left: idx * 4,
          // }}
style={{
  zIndex: idx + 1,
  top: idx * 12,
  left: idx * 12,
  opacity: 0.85,
}}
          onClick={() => setSelectedEvent(ev)}
        >
          {ev.activity_name}
        </div>
      ))}
    </div>
  )
)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedEvent && (
        <div className={styles.modalBackdrop} onClick={() => setSelectedEvent(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0, color: "#2563eb" }}>รายละเอียดกิจกรรม</h3>
            <div className={styles.detailItem}><label>ชื่อกิจกรรม</label><span>{selectedEvent.activity_name}</span></div>
            <div className={styles.detailItem}><label>สถานที่</label><span>{selectedEvent.location || "ไม่ได้ระบุ"}</span></div>
            <div style={{ display: "flex", gap: "10px" }}>
              <div className={styles.detailItem} style={{ flex: 1 }}>
                <label>เริ่ม</label>
                <span>{new Date(selectedEvent.start_datetime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} น.</span>
              </div>
              <div className={styles.detailItem} style={{ flex: 1 }}>
                <label>ถึง</label>
                <span>{new Date(selectedEvent.end_datetime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} น.</span>
              </div>
            </div>
            <button className={styles.btnNav} style={{ width: "100%", marginTop: "10px" }} onClick={() => setSelectedEvent(null)}>ปิดหน้าต่าง</button>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <h3 style={{ marginTop: 0 }}>สร้างกิจกรรมใหม่</h3>
            <input placeholder="ชื่อกิจกรรม" onChange={(e) => setForm({ ...form, activity_name: e.target.value })} />
            <input placeholder="สถานที่" onChange={(e) => setForm({ ...form, location: e.target.value })} />
            <div style={{ display: "flex", gap: "10px" }}>
              <input type="date" style={{ flex: 2 }} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              <input type="time" style={{ flex: 1 }} onChange={(e) => setForm({ ...form, start_time: e.target.value })} />
              <input type="time" style={{ flex: 1 }} onChange={(e) => setForm({ ...form, end_time: e.target.value })} />
            </div>
            <select onChange={(e) => setForm({ ...form, activity_type: e.target.value })}>
              {GROUPS.map((g) => <option key={g.code} value={g.code}>{g.label}</option>)}
            </select>
            <div style={{ display: "flex", gap: "10px" }}>
              <button className={styles.btnCreate} onClick={submit}>บันทึก</button>
              <button className={styles.btnNav} onClick={() => setShowModal(false)}>ยกเลิก</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}