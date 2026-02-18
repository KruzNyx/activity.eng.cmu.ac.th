// app\layout.js
import "./globals.css";

export const metadata = {
  title: "Calendar",
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}