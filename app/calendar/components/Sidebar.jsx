// Sidebar.jsx
import styles from "../sidebar.module.css";
import { GROUPS, SHIFTS, MONTHS_TH } from "../utils/constants";

export default function Sidebar({ 
  me, 
  year, 
  month, 
  currentDate, 
  setCurrentDate, 
  eventFilter, 
  toggleEventFilter, 
  shiftFilter, 
  toggleShiftFilter, 
  handleLogout 
}) {
  return (
    <aside className={styles.leftSidebar}>
      {/* --- ส่วนหัว Filters --- */}
      <div className={styles.filterHeader}>
        <div className={styles.filterIconBox}>
          <img src="/uploads/logo.png" className={styles.filterIcon} alt="logo"/>
        </div>
        <div>
          <h2 className={styles.headerTitle}>งานพัฒนฯ</h2>
          <p className={styles.headerSubtitle}>คณะวิศวกรรมศาสตร์ </p>
          <p className={styles.headerSubtitle}>มหาวิทยาลัยเชียงใหม่</p>
        </div>
      </div>

      {/* selection filter slicer */}
      <div className={styles.pickerRow}>
        <select
          className={styles.customSelect}
          value={year}
          onChange={(e) => {
            const next = new Date(currentDate);
            next.setFullYear(+e.target.value);
            setCurrentDate(next);
          }}
        >
          {Array.from({ length: 11 }, (_, i) => {
            const y = new Date().getFullYear() - 5 + i;
            return <option key={y} value={y}>{y + 543}</option>;
          })}
        </select>
        <select
          className={styles.customSelect}
          value={month}
          onChange={(e) => {
            const next = new Date(currentDate);
            next.setMonth(+e.target.value);
            setCurrentDate(next);
          }}
        >
          {MONTHS_TH.map((m, i) => (
            <option key={i} value={i}>{m}</option>
          ))}
        </select>
      </div>

      {/* หน่วยงาน department */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          {/* <span className={styles.sectionIcon}>📅</span> */}
          <h3>หน่วยงาน</h3>
          <span className={styles.arrowUp}>⌃</span>
        </div>
        <div className={styles.cardList}>
          {GROUPS.map(g => (
            <div 
              key={g.code}
              className={`${styles.filterCard} ${eventFilter === g.code ? styles.activeCard : ""}`}
              onClick={() => toggleEventFilter(g.code)}
            >
              <div className={`${styles.iconCircle} ${styles[`bg_${g.code.toLowerCase()}`]}`}>
                {g.code === 'SMO' ? '🏥' : g.code === 'SD' ? '👥' : '🧠'}
              </div>
              <div className={styles.cardText}>
                <span className={styles.labelTitle}>{g.label}</span>
                <div className={styles.statusRow}>
                  <span className={`${styles.dot} ${styles[`dot_${g.code.toLowerCase()}`]}`}></span>
                  <span className={styles.statusText}>Active</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* นักจิต */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          {/* <span className={styles.sectionIcon}>👥</span> */}
          <h3>นักจิตวิทยา</h3>
          <span className={styles.arrowUp}>⌃</span>
        </div>
        <div className={styles.cardList}>
          {SHIFTS.map(g => (
            <div 
              key={g.code}
              className={`${styles.filterCard} ${shiftFilter === g.code ? styles.activeCard : ""}`}
              onClick={() => toggleShiftFilter(g.code)}
            >
              <div className={styles.avatarCircle}>
                {/* text ในวงกลม ค่ตเท่ */}
                {g.label.charAt(0)}
              </div>
              <div className={styles.cardText}>
                <span className={styles.labelTitle}>{g.label}</span>
                <span className={styles.subLabel}>นักจิตหน่วยงาน</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* สรุป summaries */}
      <div className={styles.statsCard}>
        <p className={styles.statsHeader}>QUICK STATS</p>
        <div className={styles.statsRow}>
          <span>Total Events</span>
          <span className={styles.statsValue}>24</span>
        </div>
        <div className={styles.statsRow}>
          <span>This Week</span>
          <span className={styles.statsValue}>8</span>
        </div>
      </div>

      <button onClick={handleLogout} className={styles.logoutLink}>
        Logout: {me?.username}
      </button>
    </aside>
  );
}