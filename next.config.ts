// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */
// };

// export default nextConfig;


/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,

  // 🔑 แก้ cross origin dev client
  allowedDevOrigins: [
    "http://localhost:3000",
    "http://10.121.194.12:3000"
  ],
}

module.exports = nextConfig