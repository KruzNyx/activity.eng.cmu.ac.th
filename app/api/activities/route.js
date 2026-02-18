// app\api\activities\routeModule.js
import db from "@/database/database";

export async function GET() {
  try {
    const [rows] = await db.query(
      "SELECT * FROM activities ORDER BY start_datetime ASC"
    );
    return Response.json(rows || []);
  } catch (error) {
    console.error("GET ACTIVITIES ERROR:", error);
    return Response.json(
      { error: "ดึงข้อมูลกิจกรรมไม่สำเร็จ: " + error.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const data = await req.json();
    
    if (!data.activity_name || !data.start_datetime || !data.end_datetime) {
      return Response.json({ error: "ข้อมูลไม่ครบถ้วน" }, { status: 400 });
    }

    const [result] = await db.query(
      "INSERT INTO activities (activity_name, location, start_datetime, end_datetime, activity_type) VALUES (?, ?, ?, ?, ?)",
      [
        data.activity_name,
        data.location || null,
        data.start_datetime,
        data.end_datetime,
        data.activity_type || 'SMO'
      ]
    );

    return Response.json({ success: true, id: result.insertId });
  } catch (error) {
    console.error("POST ACTIVITIES ERROR:", error);
    return Response.json(
      { error: "บันทึกกิจกรรมไม่สำเร็จ: " + error.message },
      { status: 500 }
    );
  }
}