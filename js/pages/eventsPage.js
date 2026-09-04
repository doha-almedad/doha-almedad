/* =========================================================
   دوحة المداد — eventsPage.js
   2. قسم الفعاليات: عرض التحديات والمسابقات الجارية والقادمة
   ========================================================= */

import { store } from "../db/store.js";
import { bindParticipantLinks } from "../components/modals.js";
import { icon, arNum, avatarHtml } from "../components/icons.js";

const VERIFY_LABEL = {
  automatic: { ic: "chart", label: "تحقّق تلقائي" },
  select_existing_content: { ic: "book", label: "اختيار من أعمالك" },
  manual_submission: { ic: "document", label: "إثبات خارجي" },
  admin_verification: { ic: "shield", label: "اعتماد إداري" },
};

function statusOf(ev){
  const now = Date.now();
  if(now < new Date(ev.startDate).getTime()) return { label: "قادمة", cls: "badge-pill" };
  if(now > new Date(ev.endDate).getTime()) return { label: "انتهت", cls: "badge-pill" };
  return { label: "جارية الآن", cls: "badge-pill badge-pill--sage" };
}

export function renderEventsPage(root){
  const user = store.getCurrentUser();
  const sectionName = store.getSettings().sectionNames.events;
  const events = store.getEvents();

  root.innerHTML = `
    <section class="section">
      <div class="container">
        <div class="section-head">
          <div><span class="eyebrow">التحديات والمسابقات</span><h1>${icon("calendar", { size: 26, cls: "heading-icon" })} ${sectionName}</h1></div>
        </div>
        <div class="grid grid-3" id="events-grid">
          ${events.map(ev => {
            const st = statusOf(ev);
            const verify = VERIFY_LABEL[ev.verificationMethod];
            return `
            <div class="card card--hover event-card">
              <div class="highlight-card__meta">
                <span class="${st.cls}">${st.label}</span>
                <span class="badge-pill">${icon(verify.ic, { size: 13 })} ${verify.label}</span>
              </div>
              <h3 class="highlight-card__title"><a href="#/events/${ev.id}">${ev.title}</a></h3>
              <p>${ev.description}</p>
              <div class="event-card__meta">
                <span>${icon("users", { size: 14 })} ${arNum(ev.participants.length)} مشارك</span>
                <span>حتى ${new Date(ev.endDate).toLocaleDateString("ar")}</span>
              </div>
              <div style="margin-top:16px;display:flex;gap:10px;flex-wrap:wrap;">
                <a href="#/events/${ev.id}" class="btn btn-primary btn-sm">انضم الآن</a>
                <a href="#/events/${ev.id}/participants" class="btn btn-outline btn-sm">${icon("users", { size: 14 })}<span>الاطلاع على المشاركات</span></a>
              </div>
            </div>`;
          }).join("")}
        </div>
      </div>
    </section>
  `;
}

/** صفحة كاملة مستقلة لعرض المشاركات العلنية في فعالية — وليست نافذة منبثقة */
export function renderEventParticipantsPage(root, eventId){
  const ev = store.getEvent(eventId);
  if(!ev){
    root.innerHTML = `<div class="container section"><div class="empty-state"><div class="empty-state__icon">${icon("search", { size: 26 })}</div><p>لم يُعثر على هذه الفعالية.</p></div></div>`;
    return;
  }
  const publicSubs = store.getEventSubmissions().filter(s => s.eventId === ev.id && s.public && s.status !== "rejected");

  root.innerHTML = `
    <section class="section">
      <div class="container container--narrow">
        <a href="#/events/${ev.id}" class="text-muted" style="font-size:.85rem;display:inline-flex;align-items:center;gap:6px;">${icon("chevronRight", { size: 14 })}<span>العودة إلى الفعالية</span></a>

        <div class="section-head" style="margin-top:16px;">
          <div><span class="eyebrow">المشاركات العلنية</span><h1>${icon("users", { size: 26, cls: "heading-icon" })} ${ev.title}</h1></div>
        </div>

        ${publicSubs.length ? `
          <div style="display:flex;flex-direction:column;gap:14px;">
            ${publicSubs.map(s => {
              const p = store.getUser(s.userId);
              return `
                <div class="card">
                  <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;" class="participant-link" data-user-id="${s.userId}">
                    <div class="avatar avatar--sm">${avatarHtml(p)}</div>
                    <span style="font-weight:700;">${p?.displayName || "عضو"}</span>
                  </div>
                  <p style="margin:0;">${s.payload?.text || ""}</p>
                </div>
              `;
            }).join("")}
          </div>
        ` : `<div class="empty-state"><div class="empty-state__icon">${icon("users", { size: 26 })}</div><p>لا مشاركات علنية بعد لهذه الفعالية.</p></div>`}
      </div>
    </section>
  `;

  bindParticipantLinks(root);
}
