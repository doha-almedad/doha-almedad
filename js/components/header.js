/* =========================================================
   دوحة المداد — header.js
   الشريط العلوي وشريط التنقل بين صفحات الموقع
   ========================================================= */

import { store } from "../db/store.js";
import { openModal } from "./modals.js";

const NAV_LINKS = [
  { path: "#/",            label: "الرئيسية" },
  { path: "#/events",       label: "الفعاليات" },
  { path: "#/writing",      label: "الكتابة" },
  { path: "#/reading",      label: "القراءة" },
  { path: "#/articles",     label: "المقالات" },
  { path: "#/leaderboard",  label: "المتصدرون" },
];

function timeAgo(iso){
  const diffMin = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if(diffMin < 1) return "الآن";
  if(diffMin < 60) return `منذ ${diffMin} د`;
  const h = Math.round(diffMin/60);
  if(h < 24) return `منذ ${h} س`;
  return `منذ ${Math.round(h/24)} يوم`;
}

function notificationsPanel(){
  const user = store.getCurrentUser();
  const items = store.getNotifications(user.id).slice(0, 10);
  const body = items.length
    ? `<ul>${items.map(n => `
        <li style="display:flex;gap:10px;padding:10px 0;border-bottom:1px solid var(--ink-700);">
          <span>${n.icon}</span>
          <span style="flex:1;">
            <div style="font-size:.88rem;">${n.text}</div>
            <div style="font-size:.72rem;color:var(--paper-faint);">${timeAgo(n.date)}</div>
          </span>
        </li>`).join("")}</ul>`
    : `<div class="empty-state"><div class="empty-state__icon">🕊️</div><p>لا إشعارات جديدة الآن</p></div>`;

  openModal(`
    <div class="modal-box__head"><h3>الإشعارات</h3><button class="modal-close" data-close>✕</button></div>
    ${body}
  `);
  store.markNotificationsRead(user.id);
  renderHeader(currentActivePath);
}

function profileMenu(user){
  openModal(`
    <div class="modal-box__head"><h3>حسابك</h3><button class="modal-close" data-close>✕</button></div>
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:18px;">
      <div class="avatar avatar--lg">${user.avatarEmoji}</div>
      <div>
        <div style="font-weight:700;">${user.displayName}</div>
        <div class="text-muted" style="font-size:.85rem;">${user.literaryTitle} · المستوى ${user.level}</div>
      </div>
    </div>
    <div class="field">
      <label>التبديل بين الأعضاء (عرض توضيحي)</label>
      <select id="switch-user-select">
        ${store.getUsers().map(u => `<option value="${u.id}" ${u.id===user.id?"selected":""}>${u.displayName}</option>`).join("")}
      </select>
    </div>
    <a class="btn btn-outline btn-block" href="#/profile">عرض الملف الشخصي</a>
    ${user.role === "owner" ? `<a class="btn btn-ghost btn-block" href="#/admin" style="margin-top:8px;">لوحة تحكم المالكين</a>` : ""}
  `, {
    onMount(box){
      box.querySelector("#switch-user-select").addEventListener("change", (e) => {
        store.setCurrentUser(e.target.value);
        document.dispatchEvent(new CustomEvent("user:changed"));
        document.querySelector('[data-close]')?.click();
      });
    }
  });
}

let currentActivePath = "#/";

export function renderHeader(activePath = "#/"){
  currentActivePath = activePath;
  const user = store.getCurrentUser();
  const unread = store.getNotifications(user.id).some(n => !n.read);
  const mount = document.getElementById("app-header");
  if(!mount) return;

  mount.innerHTML = `
    <header class="site-header">
      <div class="site-header__inner">
        <a href="#/" class="brand"><span class="brand__mark">🖋️</span> دوحة المداد</a>

        <button class="nav-toggle" id="nav-toggle" aria-label="فتح القائمة">☰</button>

        <nav class="site-nav" id="site-nav">
          ${NAV_LINKS.map(l => `<a href="${l.path}" class="${activePath === l.path ? "is-active" : ""}">${l.label}</a>`).join("")}
        </nav>

        <div class="header-actions">
          <button class="icon-btn" id="btn-notifications" aria-label="الإشعارات">
            🔔 ${unread ? '<span class="icon-btn__dot"></span>' : ""}
          </button>
          <div class="header-profile" id="btn-profile">
            <div class="avatar avatar--sm">${user.avatarEmoji}</div>
          </div>
        </div>
      </div>
    </header>
  `;

  mount.querySelector("#nav-toggle").addEventListener("click", () => {
    mount.querySelector("#site-nav").classList.toggle("is-open");
  });
  mount.querySelectorAll("#site-nav a").forEach(a => a.addEventListener("click", () => {
    mount.querySelector("#site-nav").classList.remove("is-open");
  }));
  mount.querySelector("#btn-notifications").addEventListener("click", notificationsPanel);
  mount.querySelector("#btn-profile").addEventListener("click", () => profileMenu(user));
}
