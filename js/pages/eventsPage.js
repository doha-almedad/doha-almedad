/* =========================================================
   دوحة المداد — eventsPage.js
   2. قسم الفعاليات: عرض التحديات والمسابقات الجارية والقادمة
   ========================================================= */

import { store } from "../db/store.js";
import { showToast } from "../components/modals.js";
import { processActivity } from "../services/rewardEngine.js";

const VERIFY_LABEL = {
  automatic: "🤖 تحقّق تلقائي",
  select_existing_content: "📚 اختيار من أعمالك",
  manual_submission: "🧾 إثبات خارجي",
  admin_verification: "🛡️ اعتماد إداري"
};

function statusOf(ev){
  const now = Date.now();
  if(now < new Date(ev.startDate).getTime()) return { label: "قادمة", cls: "badge-pill" };
  if(now > new Date(ev.endDate).getTime()) return { label: "انتهت", cls: "badge-pill" };
  return { label: "جارية الآن", cls: "badge-pill badge-pill--sage" };
}

export function renderEventsPage(root){
  const user = store.getCurrentUser();
  const events = store.getEvents();

  root.innerHTML = `
    <section class="section">
      <div class="container">
        <div class="section-head">
          <div><span class="eyebrow">التحديات والمسابقات</span><h1>الفعاليات الأدبية</h1></div>
        </div>
        <div class="grid grid-3" id="events-grid">
          ${events.map(ev => {
            const st = statusOf(ev);
            const joined = ev.participants.includes(user.id);
            return `
            <div class="card card--hover event-card">
              <div class="highlight-card__meta">
                <span class="${st.cls}">${st.label}</span>
                <span class="badge-pill">${VERIFY_LABEL[ev.verificationMethod]}</span>
              </div>
              <h3 class="highlight-card__title"><a href="#/events/${ev.id}">${ev.title}</a></h3>
              <p>${ev.description}</p>
              <div class="event-card__meta">
                <span>👥 ${ev.participants.length} مشارك</span>
                <span>حتى ${new Date(ev.endDate).toLocaleDateString("ar")}</span>
              </div>
              <div style="margin-top:16px;display:flex;gap:10px;">
                <a href="#/events/${ev.id}" class="btn btn-outline btn-sm">التفاصيل</a>
                ${joined
                  ? `<span class="btn btn-ghost btn-sm" style="cursor:default;">✓ منضمّ إليها</span>`
                  : `<button class="btn btn-primary btn-sm" data-join="${ev.id}">انضمام</button>`}
              </div>
            </div>`;
          }).join("")}
        </div>
      </div>
    </section>
  `;

  root.querySelectorAll("[data-join]").forEach(btn => {
    btn.addEventListener("click", () => {
      const evId = btn.getAttribute("data-join");
      store.joinEvent(evId, user.id);
      processActivity(user.id, "join_event", { eventId: evId });
      showToast("انضممت إلى الفعالية — بالتوفيق في رحلتك 🌿");
      renderEventsPage(root);
    });
  });
}
