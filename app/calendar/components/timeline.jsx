// timeline.jsx
import styles from "../calendar.module.css";
import { GROUPS, MONTHS_TH } from "../utils/constants";

export default function Timeline({ events, eventFilter, setSelectedEvent }) {
  // const filteredEvents = events
  //   .filter(e => eventFilter === "ทั้งหมด" || e.activity_type === eventFilter)
  //   .sort((a, b) => new Date(a.start_datetime) - new Date(b.start_datetime))
  //   .slice(0, 15);
  const filteredEvents = (events || [])
  .filter(e => eventFilter === "ทั้งหมด" || e.activity_type === eventFilter)
  .sort((a, b) => new Date(a.start_datetime) - new Date(b.start_datetime))
  .slice(0, 15);

  return (
    <aside className={styles.rightTimeline}>
      <div className={styles.timelineHeader}>
        <h3>กิจกรรม{eventFilter === "ทั้งหมด" ? "ทั้งหมด" : `กลุ่ม ${eventFilter}`}</h3>
      </div>
      
      <div className={styles.timelineList}>
        {filteredEvents.map((ev) => {
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
                  {/* {ev.activity_type[0]} */}
                  {ev.activity_type?.[0] || "?"}
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
                <p className={styles.eventLocation}>{ev.location ? `@ ${ev.location}` : "—"}</p>
                {isSameDay && (
                  <p className={styles.eventTime}>
                    {startDate.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                  </p>
                )}
              </div>
            </div>
          );
        })}
        {filteredEvents.length === 0 && (
          <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>
            ไม่มีกิจกรรมในหมวดหมู่นี้
          </div>
        )}
      </div>
    </aside>
  );
}