/* =========================================================
   دوحة المداد — icons.js
   مكتبة رموز خطية مرسومة يدوياً (SVG) — بديل كامل عن الإيموجي
   في كل واجهات المنصة. كل دالة تُعيد نص SVG جاهز للحقن في DOM.
   ========================================================= */

const base = (inner, { size = 20, cls = "" } = {}) => `
  <svg class="icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24"
       fill="none" stroke="currentColor" stroke-width="1.8"
       stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>
`;

const PATHS = {
  home: `<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5"/>`,
  calendar: `<rect x="3" y="4.5" width="18" height="16" rx="2"/><path d="M16 2.5v4M8 2.5v4M3 9.5h18"/>`,
  feather: `<path d="M12 19h9"/><path d="M16.5 4.5a2.1 2.1 0 0 1 3 3L8 19l-4.5 1 1-4.5Z"/>`,
  book: `<path d="M3 4.5h5.5A3.5 3.5 0 0 1 12 8v13a3 3 0 0 0-3-2.5H3Z"/><path d="M21 4.5h-5.5A3.5 3.5 0 0 0 12 8v13a3 3 0 0 1 3-2.5h6Z"/>`,
  document: `<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h6"/>`,
  chart: `<path d="M4 20V10M12 20V4M20 20v-7"/><path d="M2.5 20h19"/>`,
  user: `<circle cx="12" cy="8" r="3.6"/><path d="M4.5 20.2a7.5 7.5 0 0 1 15 0"/>`,
  users: `<circle cx="9" cy="8" r="3.2"/><path d="M3 20a6 6 0 0 1 12 0"/><path d="M16 4.8a3.2 3.2 0 0 1 0 6.4"/><path d="M21 20a5.5 5.5 0 0 0-4.5-5.4"/>`,
  bell: `<path d="M6 9a6 6 0 0 1 12 0c0 6 2.2 7.8 2.2 7.8H3.8S6 15 6 9Z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>`,
  logout: `<path d="M9 21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3"/><path d="M15.5 16.5 21 11l-5.5-5.5"/><path d="M21 11H9"/>`,
  shield: `<path d="M12 3 4.5 6v6c0 5 3.3 7.7 7.5 9 4.2-1.3 7.5-4 7.5-9V6Z"/>`,
  star: `<path d="m12 3 2.7 5.8 6.3.7-4.7 4.4 1.2 6.3L12 17.1l-5.5 3.1 1.2-6.3-4.7-4.4 6.3-.7Z"/>`,
  heart: `<path d="M20.3 5.1a5 5 0 0 0-7.3 0L12 6.2l-1-1.1a5 5 0 0 0-7.3 7.1l1 1L12 21l7.3-7.8 1-1a5 5 0 0 0 0-7.1Z"/>`,
  comment: `<path d="M20.5 11.5a8 8 0 0 1-8.4 8H12l-6 2 1.8-4.5A8 8 0 1 1 20.5 11.5Z"/>`,
  search: `<circle cx="10.5" cy="10.5" r="7"/><path d="m20.5 20.5-4.8-4.8"/>`,
  lock: `<rect x="4" y="10.5" width="16" height="10" rx="2"/><path d="M7.5 10.5V7a4.5 4.5 0 0 1 9 0v3.5"/>`,
  medal: `<circle cx="12" cy="8.2" r="6.2"/><path d="m8.4 13.8-1.2 8 4.8-2.7 4.8 2.7-1.2-8"/><path d="M9.6 8.2 11 9.8l3.4-3.6"/>`,
  flame: `<path d="M8.6 14.4a2.4 2.4 0 0 0 4.8 0c0-1.3-.5-1.9-1-2.8-1-2 0-3.7 1.8-5.5.5 2.3 1.8 4.4 3.6 5.8 1.8 1.5 2.7 3.2 2.7 5a7 7 0 1 1-14 0c0-1.1.4-2.1 1-2.8a2.4 2.4 0 0 0 1.1 2.3Z"/>`,
  chevronLeft: `<path d="m15 6-6 6 6 6"/>`,
  chevronRight: `<path d="m9 6 6 6-6 6"/>`,
  close: `<path d="M6 6l12 12M18 6 6 18"/>`,
  plus: `<path d="M12 5v14M5 12h14"/>`,
  image: `<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="m21 15-5-5-5.5 5.5M9 14.5 6 17.5"/>`,
  upload: `<path d="M12 15V4"/><path d="m7 8.5 5-5 5 5"/><path d="M4.5 15v3.5a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V15"/>`,
  target: `<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.8"/><circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none"/>`,
  eye: `<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="3"/>`,
  send: `<path d="m3 11 18-8-8 18-2.5-7.5L3 11Z"/>`,
  quill: `<path d="M20 4c-6 1-11 6-13 12l-2 4 4-2c6-2 11-7 12-13Z"/><path d="M9.5 14.5 4 20"/>`,
};

export function icon(name, opts = {}){
  const inner = PATHS[name];
  if(!inner){ return ""; }
  return base(inner, opts);
}

/** حرف افتتاحي كبديل عن صور/إيموجي الأفاتار — دائرة بأول حرف من الاسم */
export function initial(displayName = "?"){
  return (displayName.trim().charAt(0) || "؟").toUpperCase();
}

/** التسمية العلنية للدور — المالك والمشرف يظهران للجميع باسم "مسؤول" فقط */
export function publicRoleLabel(role){
  return (role === "owner" || role === "moderator") ? "مسؤول" : null;
}

/** رسمة كتاب زخرفية بدرجات اللون الزيتي — للاستخدام في العبارة الترحيبية بالصفحة الرئيسية */
export function heroBookIllustration({ size = 240 } = {}){
  return `
    <svg viewBox="0 0 240 240" width="${size}" height="${size}" aria-hidden="true">
      <defs>
        <linearGradient id="heroBookCover" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="var(--olive-mid)"/>
          <stop offset="1" stop-color="var(--olive-deep)"/>
        </linearGradient>
      </defs>
      <g transform="translate(120 128) rotate(-8)">
        <rect x="-78" y="-100" width="156" height="200" rx="10" fill="var(--olive-light)" opacity=".55"></rect>
        <rect x="-70" y="-92" width="140" height="184" rx="8" fill="url(#heroBookCover)"></rect>
        <rect x="-70" y="-92" width="140" height="184" rx="8" fill="none" stroke="var(--olive-deep)" stroke-width="2" opacity=".4"></rect>
        <line x1="-70" y1="-92" x2="-70" y2="92" stroke="var(--olive-deep)" stroke-width="3" opacity=".55"></line>
        <text x="0" y="10" text-anchor="middle" font-family="var(--font-brand)" font-size="26" fill="var(--paper)" opacity=".92">دوحة</text>
        <line x1="-42" y1="58" x2="42" y2="58" stroke="var(--paper)" stroke-width="1.5" opacity=".5"></line>
      </g>
      <g transform="translate(184 62)" fill="var(--olive-deep)" opacity=".8">
        <path d="M0 -14 L4 -4 L14 0 L4 4 L0 14 L-4 4 L-14 0 L-4 -4 Z"></path>
      </g>
      <g transform="translate(48 190)" fill="var(--olive-mid)" opacity=".7">
        <path d="M0 -8 L2.4 -2.4 L8 0 L2.4 2.4 L0 8 L-2.4 2.4 L-8 0 L-2.4 -2.4 Z"></path>
      </g>
    </svg>
  `;
}
