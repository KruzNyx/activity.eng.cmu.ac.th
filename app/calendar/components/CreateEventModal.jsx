// CreateEventModal.jsx
"use client";
import styles from "../createevent.module.css";
import { GROUPS, SHIFTS } from "../utils/constants";

export default function CreateEventModal({ 
  showModal, 
  setShowModal, 
  createMode, 
  form, 
  setForm, 
  handleSubmit 
}) {
  if (!showModal) return null;

  return (
    <div className={styles.overlay} onClick={() => setShowModal(false)}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <h3>{createMode === "SHIFT" ? "เพิ่มเวรนักจิต" : "สร้างกิจกรรมใหม่"}</h3>
        <form onSubmit={handleSubmit} className={styles.createForm}>
          {createMode === "SHIFT" ? (
            <div className={styles.formGroup}>
              <label>นักจิต</label>
              <select 
                required 
                value={form.psychologist_name} 
                onChange={e => setForm({ ...form, psychologist_name: e.target.value })}
              >
                <option value="">-- เลือก --</option>
                {SHIFTS.map(s => <option key={s.code} value={s.code}>{s.label}</option>)}
              </select>
            </div>
          ) : (
            <>
              <div className={styles.formGroup}>
                <label>ชื่อกิจกรรม</label>
                <input 
                  required 
                  value={form.activity_name} 
                  onChange={e => setForm({...form, activity_name: e.target.value})} 
                />
              </div>
              <div className={styles.formGroup}>
                <label>หน่วยงาน</label>
                <select 
                  required 
                  value={form.activity_type} 
                  onChange={e => setForm({ ...form, activity_type: e.target.value })}
                >
                  {GROUPS.map(g => <option key={g.code} value={g.code}>{g.label}</option>)}
                </select>
              </div>
            </>
          )}
          
          <div className={styles.formGroup}>
            <label>สถานที่</label>
            <input 
              value={form.location} 
              onChange={e => setForm({...form, location: e.target.value})} 
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>เริ่ม</label>
              <input type="date" value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} />
              <input type="time" value={form.start_time} onChange={e => setForm({...form, start_time: e.target.value})} />
            </div>
            <div className={styles.formGroup}>
              <label>จบ</label>
              <input type="date" value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})} />
              <input type="time" value={form.end_time} onChange={e => setForm({...form, end_time: e.target.value})} />
            </div>
          </div>

          <div className={styles.modalButtons}>
            <button type="button" className={styles.closeBtn} onClick={() => setShowModal(false)}>ยกเลิก</button>
            <button type="submit" className={styles.btnCreateSubmit}>บันทึกข้อมูล</button>
          </div>
        </form>
      </div>
    </div>
  );
}