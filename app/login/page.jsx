// app\login\page.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./login.module.css";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const login = async () => {
    setError("");
    setLoading(true);

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    setLoading(false);

    if (res.ok) {
      router.replace("/calendar");
    } else {
      const data = await res.json();
      setError(data.error || "เข้าสู่ระบบไม่สำเร็จ");
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <h2 className={styles.title}>เข้าสู่ระบบ</h2>

        <input
          className={styles.input}
          placeholder="CMU Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className={styles.input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className={styles.error}>{error}</p>}

        <button
          className={styles.button}
          onClick={login}
          disabled={loading}
        >
          {loading ? "กำลังเข้าสู่ระบบ..." : "Login"}
        </button>
      </div>
    </div>
  );
}