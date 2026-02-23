export const fmtTime = (dt) =>
  new Date(dt).toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  });

export const getPos = (dt, ratio) => 
  (new Date(dt).getHours() * 60 + new Date(dt).getMinutes()) * ratio;

export const getH = (s, en, ratio) => 
  Math.max(25, (new Date(en) - new Date(s)) / 60000 * ratio);