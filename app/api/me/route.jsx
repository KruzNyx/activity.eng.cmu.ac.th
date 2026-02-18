// app\api\me\route.jsx
import { cookies } from "next/headers";
import db from "@/database/database";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("user_id")?.value;
    
    if (!userId) return Response.json(null);

    const [rows] = await db.query(
      "SELECT user_id, username, role FROM users WHERE user_id = ?",
      [userId]
    );

    if (!rows || rows.length === 0) return Response.json(null);

    return Response.json(rows[0]);
  } catch (error) {
    console.error("API ME ERROR:", error);
    return Response.json(null);
  }
}