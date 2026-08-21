/* =========================================================
   دوحة المداد — header.js
   الشريط العلوي وشريط التنقل بين صفحات الموقع
   ========================================================= */

import { store } from "../db/store.js";
import { openModal } from "./modals.js";
import { icon, initial, publicRoleLabel } from "./icons.js";

const NAV_LINKS = [
  { path: "#/",            label: "الرئيسية",  ic: "home" },
  { path: "#/events",       label: "الفعاليات",  ic: "calendar" },
  { path: "#/writing",      label: "الكتابة",   ic: "feather" },
  { path: "#/reading",      label: "القراءة",   ic: "book" },
  { path: "#/articles",     label: "المقالات",  ic: "document" },
  { path: "#/leaderboard",  label: "الإحصائيات", ic: "chart" },
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
        <li style="display:flex;gap:10px;padding:10px 0;border-bottom:1px solid var(--ink-700);align-items:flex-start;">
          <span style="color:var(--gold);">${icon(n.icon || "bell", { size: 17 })}</span>
          <span style="flex:1;">
            <div style="font-size:.88rem;">${n.text}</div>
            <div style="font-size:.72rem;color:var(--paper-faint);">${timeAgo(n.date)}</div>
          </span>
        </li>`).join("")}</ul>`
    : `<div class="empty-state"><div class="empty-state__icon">${icon("bell", { size: 30 })}</div><p>لا إشعارات جديدة الآن</p></div>`;

  openModal(`
    <div class="modal-box__head"><h3>الإشعارات</h3><button class="modal-close" data-close>${icon("close", { size: 18 })}</button></div>
    ${body}
  `);
  store.markNotificationsRead(user.id);
  renderHeader(currentActivePath);
}

function accountMenu(user){
  openModal(`
    <div class="modal-box__head"><h3>حسابك</h3><button class="modal-close" data-close>${icon("close", { size: 18 })}</button></div>
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:18px;">
      <div class="avatar avatar--lg">${initial(user.displayName)}</div>
      <div>
        <div style="font-weight:700;">${user.displayName}</div>
        <div class="text-muted" style="font-size:.85rem;">${publicRoleLabel(user.role) ? `<span class="badge-pill badge-pill--sage" style="margin-inline-end:6px;">${publicRoleLabel(user.role)}</span>` : ""}المستوى ${user.level}</div>
      </div>
    </div>
    <div class="field">
      <label>التبديل بين الأعضاء (عرض توضيحي)</label>
      <select id="switch-user-select">
        ${store.getUsers().map(u => `<option value="${u.id}" ${u.id===user.id?"selected":""}>${u.displayName}</option>`).join("")}
      </select>
    </div>
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
        <a href="#/" class="brand"><img src="img/logo.png" alt="" class="brand__mark"> دوحة المداد</a>

        <button class="nav-toggle" id="nav-toggle" aria-label="فتح القائمة">${icon("plus", { size: 20 })}</button>

        <nav class="site-nav" id="site-nav">
          ${NAV_LINKS.map(l => `<a href="${l.path}" class="${activePath === l.path ? "is-active" : ""}">${icon(l.ic, { size: 16 })}<span>${l.label}</span></a>`).join("")}
          <a href="#/profile" class="site-nav__profile-link ${activePath === "#/profile" ? "is-active" : ""}">${icon("user", { size: 16 })}<span>ملفي الشخصي</span></a>
          ${(user.role === "owner" || user.role === "moderator") ? `<a href="#/admin" class="site-nav__profile-link ${activePath === "#/admin" ? "is-active" : ""}">${icon("shield", { size: 16 })}<span>الإدارة</span></a>` : ""}
        </nav>

        <div class="header-actions">
          <button class="icon-btn" id="btn-notifications" aria-label="الإشعارات">
            ${icon("bell", { size: 18 })} ${unread ? '<span class="icon-btn__dot"></span>' : ""}
          </button>
          <div class="header-profile" id="btn-profile">
            <div class="avatar avatar--sm">${initial(user.displayName)}</div>
          </div>
        </div>
      </div>
    </header>
  `;

  mount.querySelector("#nav-toggle").addEventListener("click", () => {
    mount.querySelector("#site-nav").classList.toggle("is-open");
    mount.querySelector("#nav-toggle").classList.toggle("is-open");
  });
  mount.querySelectorAll("#site-nav a").forEach(a => a.addEventListener("click", () => {
    mount.querySelector("#site-nav").classList.remove("is-open");
    mount.querySelector("#nav-toggle").classList.remove("is-open");
  }));
  mount.querySelector("#btn-notifications").addEventListener("click", notificationsPanel);
  mount.querySelector("#btn-profile").addEventListener("click", () => accountMenu(user));
}
