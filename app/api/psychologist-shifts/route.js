// app\api\psychologies-shift\route.js
import db from "@/database/database";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get("name"); // น้ำขิง / ป๊อป

    let sql = "SELECT * FROM psychologist_shift";
    const params = [];

    if (name) {
      sql += " WHERE psychologist_name = ?";
      params.push(name);
    }

    sql += " ORDER BY start_datetime ASC";

    const [rows] = await db.query(sql, params);
    return Response.json(rows || []);
  } catch (error) {
    console.error("GET PSYCHOLOGIST SHIFT ERROR:", error);
    return Response.json(
      { error: "ดึงข้อมูลเวรนักจิตไม่สำเร็จ: " + error.message },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const data = await req.json();

    if (!data.psychologist_name || !data.start_datetime || !data.end_datetime) {
      return Response.json({ error: "ข้อมูลไม่ครบถ้วน" }, { status: 400 });
    }

    const [result] = await db.query(
      `INSERT INTO psychologist_shift
       (psychologist_name, location, start_datetime, end_datetime, note)
       VALUES (?, ?, ?, ?, ?)`,
      [
        data.psychologist_name,
        data.location || null,
        data.start_datetime,
        data.end_datetime,
        data.note || null
      ]
    );

    return Response.json({ success: true, id: result.insertId });
  } catch (error) {
    console.error("POST PSYCHOLOGIST SHIFT ERROR:", error);
    return Response.json(
      { error: "บันทึกเวรนักจิตไม่สำเร็จ: " + error.message },
      { status: 500 }
    );
  }
}