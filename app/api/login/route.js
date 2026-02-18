// app\api\login\route.js
import { cookies } from "next/headers";
import db from "@/database/database";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    // 1. ตรวจสอบข้อมูลจาก Database
    const [rows] = await db.query(
      "SELECT * FROM users WHERE cmu_mail = ?",
      [email]
    );

    if (!rows || rows.length === 0) {
      return Response.json({ error: "ไม่พบอีเมลนี้ในระบบ" }, { status: 401 });
    }

    const u = rows[0];

    // 2. ตรวจสอบรหัสผ่าน (Plain Text)
    if (password !== u.cmu_password) {
      return Response.json({ error: "รหัสผ่านไม่ถูกต้อง" }, { status: 401 });
    }

    // 3. ตั้งค่า Cookie
    const cookieStore = await cookies(); 
    cookieStore.set("user_id", String(u.user_id), {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: false, // เปลี่ยนเป็น false เพื่อให้ใช้บน localhost ได้ไม่มีปัญหา
      maxAge: 60 * 60 * 24, // 1 วัน
    });

    return Response.json({
      user_id: u.user_id,
      username: u.username,
      role: u.role,
    });

  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return Response.json(
      { error: "เกิดข้อผิดพลาดที่เซิร์ฟเวอร์: " + error.message }, 
      { status: 500 }
    );
  }
}